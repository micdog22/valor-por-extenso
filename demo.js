import { porExtenso, ordinal, porcentagem } from './src/index.js';

const form = document.getElementById('form');
const valueInput = document.getElementById('value');
const catorzeToggle = document.getElementById('catorze-toggle');
const genderGroup = document.getElementById('gender-group');
const output = document.getElementById('output');
const copyButton = document.getElementById('copy-button');
const notice = document.getElementById('notice');

const STORAGE_KEY = 'valor-por-extenso:preferencias';

function loadPreferences() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function savePreferences(preferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // sem armazenamento local (modo privado, por exemplo): segue sem lembrar as opções
  }
}

function check(name, value) {
  const radio = form.querySelector(`input[name="${name}"][value="${value}"]`);
  if (radio) radio.checked = true;
}

function convert(text, { mode, gender, catorze }) {
  if (mode === 'ordinal') return ordinal(text, gender);
  if (mode === 'porcentagem') return porcentagem(text, { catorze });
  return porExtenso(text, { modo: mode, genero: gender, catorze });
}

function update() {
  const settings = {
    mode: form.elements.mode.value,
    gender: form.elements.gender.value,
    catorze: catorzeToggle.checked,
  };
  const genderApplies = settings.mode === 'numero' || settings.mode === 'ordinal';
  for (const radio of form.elements.gender) radio.disabled = !genderApplies;
  genderGroup.classList.toggle('inactive', !genderApplies);

  notice.textContent = '';
  output.classList.remove('error', 'empty');
  const text = valueInput.value.trim();
  if (!text) {
    output.textContent = 'Digite um valor para ver o texto por extenso.';
    output.classList.add('empty');
    copyButton.disabled = true;
  } else {
    try {
      output.textContent = convert(text, settings);
      copyButton.disabled = false;
    } catch (error) {
      output.textContent = error.message;
      output.classList.add('error');
      copyButton.disabled = true;
    }
  }
  savePreferences(settings);
}

async function copyText() {
  const text = output.textContent;
  notice.classList.remove('failed');
  try {
    await navigator.clipboard.writeText(text);
    notice.textContent = 'Copiado!';
  } catch {
    // sem acesso à área de transferência: deixa o texto selecionado para copiar à mão
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(output);
    selection.removeAllRanges();
    selection.addRange(range);
    notice.classList.add('failed');
    notice.textContent = 'Não deu para copiar automaticamente. O texto está selecionado: use Ctrl+C.';
  }
}

const saved = loadPreferences();
if (['monetario', 'numero', 'ordinal', 'porcentagem'].includes(saved.mode)) check('mode', saved.mode);
if (['masculino', 'feminino'].includes(saved.gender)) check('gender', saved.gender);
catorzeToggle.checked = saved.catorze === true;

form.addEventListener('input', update);
form.addEventListener('change', update);
form.addEventListener('submit', (event) => event.preventDefault());
copyButton.addEventListener('click', copyText);

document.getElementById('examples').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-value]');
  if (!button) return;
  valueInput.value = button.dataset.value;
  check('mode', button.dataset.mode);
  check('gender', button.dataset.gender || 'masculino');
  update();
  valueInput.focus();
});

update();
