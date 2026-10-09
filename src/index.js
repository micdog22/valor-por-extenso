/**
 * Valor por Extenso: números e valores em reais escritos por extenso, em português do Brasil.
 *
 * Toda a conta é feita com inteiros (BigInt) sobre o texto do número, sem ponto flutuante.
 * Valores do tipo number, no modo monetário, são arredondados para centavos.
 */

const UNITS = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
const UNITS_FEMININE = ['zero', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
const TEENS = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
const TENS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const HUNDREDS = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
const HUNDREDS_FEMININE = ['', 'cento', 'duzentas', 'trezentas', 'quatrocentas', 'quinhentas', 'seiscentas', 'setecentas', 'oitocentas', 'novecentas'];

// Escala curta (a usada no Brasil). O índice é a posição do grupo de três dígitos.
const SCALES = [null, null, ['milhão', 'milhões'], ['bilhão', 'bilhões'], ['trilhão', 'trilhões'], ['quatrilhão', 'quatrilhões']];

const ORDINAL_UNITS = ['', 'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'sétimo', 'oitavo', 'nono'];
const ORDINAL_TENS = ['', 'décimo', 'vigésimo', 'trigésimo', 'quadragésimo', 'quinquagésimo', 'sexagésimo', 'septuagésimo', 'octogésimo', 'nonagésimo'];
const ORDINAL_HUNDREDS = ['', 'centésimo', 'ducentésimo', 'trecentésimo', 'quadringentésimo', 'quingentésimo', 'sexcentésimo', 'septingentésimo', 'octingentésimo', 'nongentésimo'];

/** Maior inteiro aceito: 999.999.999.999.999.999 (999 quatrilhões e tanto). */
export const VALOR_MAXIMO = 999_999_999_999_999_999n;

const DEFAULT_CURRENCY = Object.freeze({ singular: 'real', plural: 'reais', feminine: false });
const DEFAULT_CENTS = Object.freeze({ singular: 'centavo', plural: 'centavos', feminine: false });

const MODES = { monetario: 'money', 'monetário': 'money', numero: 'number', 'número': 'number' };
const GENDERS = { masculino: 'masculino', feminino: 'feminino' };

/**
 * Escreve um número ou valor monetário por extenso.
 *
 * @param {number|bigint|string} value  Ex.: 1234.56, 10n, "1.234,56", "1234.56", "R$ 10,00"
 * @param {object} [options]
 * @param {'monetario'|'numero'} [options.modo='monetario']
 * @param {'masculino'|'feminino'} [options.genero='masculino']  Vale para o modo número.
 * @param {boolean} [options.catorze=false]  Usa "catorze" em vez de "quatorze".
 * @param {{singular: string, plural: string, genero?: string}} [options.moeda]
 * @param {{singular: string, plural: string, genero?: string}} [options.centavos]
 * @returns {string}
 */
export function porExtenso(value, options) {
  const opts = readOptions(options);
  const decimal = toDecimal(value);
  return opts.mode === 'number' ? numberToWords(decimal, opts) : moneyToWords(decimal, opts);
}

/**
 * Escreve um ordinal de 1 a 999: "primeiro", "vigésimo terceiro", "centésima".
 * @param {number|bigint|string} n
 * @param {'masculino'|'feminino'|{genero: string}} [gender='masculino']
 */
export function ordinal(n, gender) {
  const feminine = readGender(gender && typeof gender === 'object' ? gender.genero : gender) === 'feminino';
  const v = readOrdinal(n);
  const parts = [ORDINAL_HUNDREDS[Math.floor(v / 100)], ORDINAL_TENS[Math.floor((v % 100) / 10)], ORDINAL_UNITS[v % 10]].filter(Boolean);
  return (feminine ? parts.map((word) => word.slice(0, -1) + 'a') : parts).join(' ');
}

/**
 * Escreve uma porcentagem: porcentagem("12,5") → "doze vírgula cinco por cento".
 * @param {number|bigint|string} value  Aceita o símbolo % no fim ("12,5%").
 * @param {{catorze?: boolean}} [options]
 */
export function porcentagem(value, options) {
  const catorze = Boolean(options && typeof options === 'object' && options.catorze);
  const v = typeof value === 'string' ? value.trim().replace(/\s*%$/, '') : value;
  return `${porExtenso(v, { modo: 'numero', catorze })} por cento`;
}

function numberToWords({ negative, integer, fraction }, opts) {
  const n = BigInt(integer);
  checkLimit(n);
  const decimals = fraction.replace(/0+$/, '');
  let text = integerToWords(n, opts.gender === 'feminino', opts.catorze);
  if (decimals) text += ` vírgula ${decimalsToWords(decimals, opts.catorze)}`;
  const isZero = n === 0n && !decimals;
  return negative && !isZero ? `menos ${text}` : text;
}

function moneyToWords({ negative, integer, fraction }, opts) {
  let n = BigInt(integer);
  let cents = Number(fraction.padEnd(2, '0').slice(0, 2));
  // arredondamento para centavos: meio para cima, olhando a terceira casa
  if (fraction.length > 2 && fraction[2] >= '5') {
    cents += 1;
    if (cents === 100) {
      cents = 0;
      n += 1n;
    }
  }
  checkLimit(n);

  const parts = [];
  if (n > 0n) {
    const name = n === 1n ? opts.currency.singular : opts.currency.plural;
    // milhões, bilhões... exatos levam "de": "um milhão de reais"
    const joiner = n % 1_000_000n === 0n ? ' de ' : ' ';
    parts.push(integerToWords(n, opts.currency.feminine, opts.catorze) + joiner + name);
  }
  if (cents > 0) {
    const name = cents === 1 ? opts.cents.singular : opts.cents.plural;
    parts.push(`${hundredsToWords(cents, opts.cents.feminine, opts.catorze)} ${name}`);
  }
  if (parts.length === 0) return `zero ${opts.currency.plural}`;
  return (negative ? 'menos ' : '') + parts.join(' e ');
}

/** Números de 1 a 999. */
function hundredsToWords(n, feminine, catorze) {
  if (n === 100) return 'cem';
  const units = feminine ? UNITS_FEMININE : UNITS;
  const parts = [];
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  if (hundreds) parts.push((feminine ? HUNDREDS_FEMININE : HUNDREDS)[hundreds]);
  if (rest >= 20) {
    parts.push(TENS[Math.floor(rest / 10)]);
    if (rest % 10) parts.push(units[rest % 10]);
  } else if (rest >= 10) {
    parts.push(rest === 14 && catorze ? 'catorze' : TEENS[rest - 10]);
  } else if (rest) {
    parts.push(units[rest]);
  }
  return parts.join(' e ');
}

function integerToWords(n, feminine, catorze) {
  if (n === 0n) return 'zero';
  const groups = [];
  for (let rest = n; rest > 0n; rest /= 1000n) groups.push(Number(rest % 1000n));

  let text = '';
  for (let i = groups.length - 1; i >= 0; i--) {
    const group = groups[i];
    if (group === 0) continue;
    let part;
    if (i === 0) part = hundredsToWords(group, feminine, catorze);
    else if (i === 1) part = group === 1 ? 'mil' : `${hundredsToWords(group, feminine, catorze)} mil`;
    // milhão, bilhão... são substantivos masculinos: "dois milhões" mesmo no feminino
    else part = `${hundredsToWords(group, false, catorze)} ${SCALES[i][group === 1 ? 0 : 1]}`;

    // Entre classes, "e" só quando a classe seguinte é menor que 100 ou uma centena redonda:
    // "mil e duzentos", "mil e noventa e nove", mas "mil duzentos e cinquenta".
    if (text) text += group < 100 || group % 100 === 0 ? ' e ' : ' ';
    text += part;
  }
  return text;
}

function decimalsToWords(digits, catorze) {
  // Até três casas, lê como número ("vírgula vinte e cinco"); mais que isso, dígito a dígito.
  if (digits.length > 3) return [...digits].map((d) => UNITS[Number(d)]).join(' ');
  const zeros = digits.match(/^0*/)[0].length;
  return [...Array(zeros).fill('zero'), hundredsToWords(Number(digits), false, catorze)].join(' ');
}

function checkLimit(n) {
  if (n > VALOR_MAXIMO) {
    throw new RangeError('Valor acima do limite: o máximo é 999.999.999.999.999.999 (999 quatrilhões).');
  }
}

function readOptions(options) {
  if (options === undefined || options === null) options = {};
  if (typeof options !== 'object') throw new TypeError('As opções devem ser um objeto, por exemplo { modo: "numero" }.');
  const mode = options.modo === undefined ? 'money' : MODES[options.modo];
  if (!mode) throw new TypeError(`Modo inválido: "${options.modo}". Use "monetario" ou "numero".`);
  return {
    mode,
    gender: readGender(options.genero),
    catorze: Boolean(options.catorze),
    currency: readUnit(options.moeda, DEFAULT_CURRENCY, 'moeda'),
    cents: readUnit(options.centavos, DEFAULT_CENTS, 'centavos'),
  };
}

function readGender(gender) {
  if (gender === undefined || gender === null) return 'masculino';
  const g = GENDERS[gender];
  if (!g) throw new TypeError(`Gênero inválido: "${gender}". Use "masculino" ou "feminino".`);
  return g;
}

function readUnit(value, fallback, optionName) {
  if (value === undefined || value === null) return fallback;
  const example = optionName === 'moeda' ? '{ singular: "dólar", plural: "dólares" }' : '{ singular: "cêntimo", plural: "cêntimos" }';
  const isFilled = (t) => typeof t === 'string' && t.trim() !== '';
  if (typeof value !== 'object' || !isFilled(value.singular) || !isFilled(value.plural)) {
    throw new TypeError(`A opção "${optionName}" precisa de singular e plural, por exemplo ${example}.`);
  }
  return { singular: value.singular.trim(), plural: value.plural.trim(), feminine: readGender(value.genero) === 'feminino' };
}

function readOrdinal(n) {
  let v = n;
  if (typeof v === 'string') {
    const t = v.trim().replace(/[ºª°]$/u, '');
    if (!/^\d+$/.test(t)) throw new TypeError(`Ordinal inválido: "${n}". Informe um número inteiro de 1 a 999.`);
    v = Number(t);
  } else if (typeof v === 'bigint') {
    v = v >= 1n && v <= 999n ? Number(v) : NaN;
  } else if (typeof v !== 'number') {
    throw new TypeError('Ordinal inválido: informe um número inteiro de 1 a 999.');
  }
  if (!Number.isInteger(v) || v < 1 || v > 999) {
    throw new RangeError('O ordinal deve ser um número inteiro de 1 a 999.');
  }
  return v;
}

/** Converte a entrada em { negative, integer, fraction }, com inteiro e fração como strings de dígitos. */
function toDecimal(value) {
  if (typeof value === 'bigint') {
    const negative = value < 0n;
    return { negative, integer: (negative ? -value : value).toString(), fraction: '' };
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('Valor inválido: o número precisa ser finito.');
    if (Number.isInteger(value)) {
      if (!Number.isSafeInteger(value)) {
        throw new RangeError('Número grande demais para o tipo number do JavaScript. Passe um BigInt ou uma string.');
      }
      return { negative: value < 0, integer: String(Math.abs(value)), fraction: '' };
    }
    // 15 algarismos significativos removem o ruído binário: 0.1 + 0.2 vira 0.3.
    const [integer, fraction = ''] = expandExponent(Math.abs(value).toPrecision(15)).split('.');
    return { negative: value < 0, integer: stripLeadingZeros(integer), fraction };
  }
  if (typeof value === 'string') return parseText(value);
  throw new TypeError('Valor inválido: informe um number, um bigint ou uma string como "1.234,56".');
}

function expandExponent(text) {
  const m = /^(\d+)(?:\.(\d+))?e([+-]\d+)$/i.exec(text);
  if (!m) return text;
  const digits = m[1] + (m[2] || '');
  const point = m[1].length + Number(m[3]);
  if (point <= 0) return `0.${'0'.repeat(-point)}${digits}`;
  if (point >= digits.length) return digits + '0'.repeat(point - digits.length);
  return `${digits.slice(0, point)}.${digits.slice(point)}`;
}

function parseText(text) {
  const m = /^([+\-\u2212]?)\s*(?:R\$)?\s*([+\-\u2212]?)\s*([\d.,]*)$/i.exec(text.trim());
  if (!m || (m[1] && m[2]) || !/\d/.test(m[3])) throw textError(text);
  const sign = m[1] || m[2];
  const { integer, fraction } = splitDecimal(m[3], text);
  return { negative: sign !== '' && sign !== '+', integer: stripLeadingZeros(integer), fraction };
}

/**
 * Decide qual é o separador decimal:
 * - com ponto e vírgula, o último que aparece é o decimal ("1.234,56" e "1,234.56");
 * - só vírgula: uma é decimal ("1234,56"); várias são de milhar;
 * - só ponto: vários são de milhar; um único seguido de exatamente três dígitos também
 *   ("1.500" é mil e quinhentos, como no Brasil); nos outros casos é decimal ("1234.56").
 */
function splitDecimal(number, original) {
  const hasDot = number.includes('.');
  const hasComma = number.includes(',');
  let integer = number;
  let fraction = '';
  let thousands = null;

  if (hasDot && hasComma) {
    const decimalMark = number.lastIndexOf(',') > number.lastIndexOf('.') ? ',' : '.';
    const position = number.lastIndexOf(decimalMark);
    if (number.indexOf(decimalMark) !== position) throw textError(original);
    thousands = decimalMark === ',' ? '.' : ',';
    integer = number.slice(0, position);
    fraction = number.slice(position + 1);
  } else if (hasDot || hasComma) {
    const separator = hasDot ? '.' : ',';
    const parts = number.split(separator);
    if (parts.length > 2 || (separator === '.' && /^[1-9]\d{0,2}\.\d{3}$/.test(number))) {
      thousands = separator;
    } else {
      [integer, fraction] = parts;
    }
  }

  if (thousands) {
    const grouping = thousands === '.' ? /^[1-9]\d{0,2}(?:\.\d{3})+$/ : /^[1-9]\d{0,2}(?:,\d{3})+$/;
    if (!grouping.test(integer)) throw textError(original);
    integer = integer.split(thousands).join('');
  }
  if (!/^\d*$/.test(integer) || !/^\d*$/.test(fraction)) throw textError(original);
  return { integer, fraction };
}

function stripLeadingZeros(digits) {
  return digits.replace(/^0+/, '') || '0';
}

function textError(text) {
  return new TypeError(`Valor inválido: "${text}". Use, por exemplo, "1.234,56" ou "1234.56".`);
}
