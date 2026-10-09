import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const CLI = fileURLToPath(new URL('../bin/extenso.js', import.meta.url));

function run(args, stdin) {
  const r = spawnSync(process.execPath, [CLI, ...args], { input: stdin ?? '', encoding: 'utf8' });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr };
}

test('valor em reais', () => {
  const r = run(['1234,56']);
  assert.equal(r.code, 0);
  assert.equal(r.stdout, 'mil duzentos e trinta e quatro reais e cinquenta e seis centavos\n');
});

test('--numero com --feminino', () => {
  const r = run(['--numero', '21', '--feminino']);
  assert.equal(r.code, 0);
  assert.equal(r.stdout, 'vinte e uma\n');
});

test('--ordinal', () => {
  assert.equal(run(['--ordinal', '23']).stdout, 'vigésimo terceiro\n');
  assert.equal(run(['-o', '-f', '23']).stdout, 'vigésima terceira\n');
});

test('--porcentagem e --catorze', () => {
  assert.equal(run(['--porcentagem', '12,5']).stdout, 'doze vírgula cinco por cento\n');
  assert.equal(run(['-n', '--catorze', '14']).stdout, 'catorze\n');
});

test('vários valores e negativo como argumento', () => {
  const r = run(['1', '-10,50', '--', '-2']);
  assert.equal(r.code, 0);
  assert.equal(r.stdout, 'um real\nmenos dez reais e cinquenta centavos\nmenos dois reais\n');
});

test('lê linhas da entrada padrão', () => {
  const r = run([], '1.000.000\n\n0,01\r\n2,50\n');
  assert.equal(r.code, 0);
  assert.equal(r.stdout, 'um milhão de reais\num centavo\ndois reais e cinquenta centavos\n');
});

test('valor inválido sai com código 1 e continua os demais', () => {
  const r = run([], 'abc\n10\n');
  assert.equal(r.code, 1);
  assert.equal(r.stdout, 'dez reais\n');
  assert.match(r.stderr, /Valor inválido: "abc"/);
});

test('opção desconhecida sai com código 2', () => {
  const r = run(['--romano', '10']);
  assert.equal(r.code, 2);
  assert.match(r.stderr, /opção desconhecida: --romano/);
});

test('--ordinal com --porcentagem é erro de uso', () => {
  assert.equal(run(['--ordinal', '--porcentagem', '1']).code, 2);
});

test('--help e --version', () => {
  const help = run(['--help']);
  assert.equal(help.code, 0);
  assert.match(help.stdout, /^Uso: extenso/);
  const version = run(['--version']);
  assert.equal(version.code, 0);
  assert.match(version.stdout, /^\d+\.\d+\.\d+\n$/);
});
