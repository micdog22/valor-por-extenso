import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { porExtenso, ordinal, porcentagem, VALOR_MAXIMO } from '../src/index.js';

const NUMBER_MODE = { modo: 'numero' };
const FEMININE = { modo: 'numero', genero: 'feminino' };

describe('valores monetários (tabela)', () => {
  const table = [
    ['0,01', 'um centavo'],
    ['0,50', 'cinquenta centavos'],
    ['1,00', 'um real'],
    ['1,01', 'um real e um centavo'],
    ['2', 'dois reais'],
    ['10', 'dez reais'],
    ['11', 'onze reais'],
    ['12', 'doze reais'],
    ['13', 'treze reais'],
    ['14', 'quatorze reais'],
    ['15', 'quinze reais'],
    ['16', 'dezesseis reais'],
    ['17', 'dezessete reais'],
    ['18', 'dezoito reais'],
    ['19', 'dezenove reais'],
    ['20', 'vinte reais'],
    ['21', 'vinte e um reais'],
    ['99', 'noventa e nove reais'],
    ['100', 'cem reais'],
    ['101', 'cento e um reais'],
    ['110', 'cento e dez reais'],
    ['115', 'cento e quinze reais'],
    ['199', 'cento e noventa e nove reais'],
    ['200', 'duzentos reais'],
    ['999', 'novecentos e noventa e nove reais'],
    ['1.000', 'mil reais'],
    ['1.001', 'mil e um reais'],
    ['1.010', 'mil e dez reais'],
    ['1.099', 'mil e noventa e nove reais'],
    ['1.100', 'mil e cem reais'],
    ['1.200', 'mil e duzentos reais'],
    ['1.250', 'mil duzentos e cinquenta reais'],
    ['1.999', 'mil novecentos e noventa e nove reais'],
    ['2.000', 'dois mil reais'],
    ['10.000', 'dez mil reais'],
    ['21.000', 'vinte e um mil reais'],
    ['100.000', 'cem mil reais'],
    ['101.000', 'cento e um mil reais'],
    ['999.999', 'novecentos e noventa e nove mil novecentos e noventa e nove reais'],
    ['1.000.000', 'um milhão de reais'],
    ['1.000.001', 'um milhão e um reais'],
    ['1.001.000', 'um milhão e mil reais'],
    ['1.100.000', 'um milhão e cem mil reais'],
    ['1.500.000', 'um milhão e quinhentos mil reais'],
    ['2.000.000,10', 'dois milhões de reais e dez centavos'],
    ['2.300.000', 'dois milhões e trezentos mil reais'],
    ['1.000.000.000', 'um bilhão de reais'],
    ['2.000.000.000', 'dois bilhões de reais'],
    ['1.500.000.000', 'um bilhão e quinhentos milhões de reais'],
    ['1.000.000.000.000', 'um trilhão de reais'],
    ['1.000.000.000.000.000', 'um quatrilhão de reais'],
    [
      '1.234.567,89',
      'um milhão duzentos e trinta e quatro mil quinhentos e sessenta e sete reais e oitenta e nove centavos',
    ],
  ];
  for (const [input, expected] of table) {
    test(`${input} → ${expected}`, () => assert.equal(porExtenso(input), expected));
  }

  test('zero', () => {
    assert.equal(porExtenso(0), 'zero reais');
    assert.equal(porExtenso('0,00'), 'zero reais');
    assert.equal(porExtenso(0n), 'zero reais');
  });

  test('o modo monetário é o padrão', () => {
    assert.equal(porExtenso(1234.56), 'mil duzentos e trinta e quatro reais e cinquenta e seis centavos');
    assert.equal(porExtenso(1234.56, { modo: 'monetário' }), porExtenso(1234.56));
  });
});

describe('modo número', () => {
  const table = [
    [0, 'zero'],
    [1, 'um'],
    [14, 'quatorze'],
    [21, 'vinte e um'],
    [100, 'cem'],
    [101, 'cento e um'],
    [1000, 'mil'],
    [1001, 'mil e um'],
    [1250, 'mil duzentos e cinquenta'],
    [1_000_000, 'um milhão'],
    [2_000_000, 'dois milhões'],
    [1_001_000, 'um milhão e mil'],
    [2_000_300, 'dois milhões e trezentos'],
    [2_000_350, 'dois milhões trezentos e cinquenta'],
    [1_200_300, 'um milhão e duzentos mil e trezentos'],
  ];
  for (const [input, expected] of table) {
    test(`${input} → ${expected}`, () => assert.equal(porExtenso(input, NUMBER_MODE), expected));
  }

  test('decimais com "vírgula"', () => {
    assert.equal(porExtenso('12,5', NUMBER_MODE), 'doze vírgula cinco');
    assert.equal(porExtenso('12,50', NUMBER_MODE), 'doze vírgula cinco');
    assert.equal(porExtenso('12,05', NUMBER_MODE), 'doze vírgula zero cinco');
    assert.equal(porExtenso('12,25', NUMBER_MODE), 'doze vírgula vinte e cinco');
    assert.equal(porExtenso('0,001', NUMBER_MODE), 'zero vírgula zero zero um');
    assert.equal(porExtenso('12,00', NUMBER_MODE), 'doze');
    assert.equal(porExtenso('3,14159', NUMBER_MODE), 'três vírgula um quatro um cinco nove');
    assert.equal(porExtenso(2.5, NUMBER_MODE), 'dois vírgula cinco');
  });

  test('não arredonda para centavos', () => {
    assert.equal(porExtenso('1,005', NUMBER_MODE), 'um vírgula zero zero cinco');
  });

  test('número máximo', () => {
    assert.equal(
      porExtenso(VALOR_MAXIMO, NUMBER_MODE),
      'novecentos e noventa e nove quatrilhões novecentos e noventa e nove trilhões ' +
        'novecentos e noventa e nove bilhões novecentos e noventa e nove milhões ' +
        'novecentos e noventa e nove mil novecentos e noventa e nove',
    );
  });
});

describe('feminino', () => {
  const table = [
    [1, 'uma'],
    [2, 'duas'],
    [12, 'doze'],
    [21, 'vinte e uma'],
    [22, 'vinte e duas'],
    [100, 'cem'],
    [101, 'cento e uma'],
    [200, 'duzentas'],
    [222, 'duzentas e vinte e duas'],
    [900, 'novecentas'],
    [1000, 'mil'],
    [2000, 'duas mil'],
    [21_000, 'vinte e uma mil'],
    [200_000, 'duzentas mil'],
    [1_000_000, 'um milhão'],
    [2_000_000, 'dois milhões'],
    [2_200_000, 'dois milhões e duzentas mil'],
    [2_002_002, 'dois milhões e duas mil e duas'],
    [200_000_000, 'duzentos milhões'],
  ];
  for (const [input, expected] of table) {
    test(`${input} → ${expected}`, () => assert.equal(porExtenso(input, FEMININE), expected));
  }

  test('o gênero não afeta reais', () => {
    assert.equal(porExtenso(2, { genero: 'feminino' }), 'dois reais');
  });

  test('moeda feminina', () => {
    const pound = { singular: 'libra', plural: 'libras', genero: 'feminino' };
    assert.equal(porExtenso(1, { moeda: pound }), 'uma libra');
    assert.equal(porExtenso(2, { moeda: pound }), 'duas libras');
    assert.equal(porExtenso(200, { moeda: pound }), 'duzentas libras');
  });
});

describe('opção catorze', () => {
  test('padrão é "quatorze"', () => {
    assert.equal(porExtenso(14, NUMBER_MODE), 'quatorze');
    assert.equal(porExtenso('0,14'), 'quatorze centavos');
  });
  test('catorze: true', () => {
    assert.equal(porExtenso(14, { modo: 'numero', catorze: true }), 'catorze');
    assert.equal(porExtenso(14_014, { modo: 'numero', catorze: true }), 'catorze mil e catorze');
    assert.equal(porExtenso('14,14', { catorze: true }), 'catorze reais e catorze centavos');
  });
});

describe('moeda personalizada', () => {
  const dollar = { singular: 'dólar', plural: 'dólares' };
  test('dólar', () => {
    assert.equal(porExtenso('1,01', { moeda: dollar }), 'um dólar e um centavo');
    assert.equal(porExtenso(1_000_000, { moeda: dollar }), 'um milhão de dólares');
    assert.equal(porExtenso(0, { moeda: dollar }), 'zero dólares');
  });
  test('centavos personalizados', () => {
    const euro = { singular: 'euro', plural: 'euros' };
    const centimes = { singular: 'cêntimo', plural: 'cêntimos' };
    assert.equal(porExtenso('2,50', { moeda: euro, centavos: centimes }), 'dois euros e cinquenta cêntimos');
  });
  test('moeda incompleta é recusada', () => {
    assert.throws(() => porExtenso(1, { moeda: { singular: 'dólar' } }), TypeError);
    assert.throws(() => porExtenso(1, { moeda: 'dólar' }), TypeError);
  });
});

describe('negativos', () => {
  test('monetário', () => {
    assert.equal(porExtenso(-1), 'menos um real');
    assert.equal(porExtenso('-1.234,56'), 'menos mil duzentos e trinta e quatro reais e cinquenta e seis centavos');
    assert.equal(porExtenso('-0,50'), 'menos cinquenta centavos');
    assert.equal(porExtenso('R$ -10,00'), 'menos dez reais');
    assert.equal(porExtenso('-R$ 10,00'), 'menos dez reais');
    assert.equal(porExtenso('\u221210'), 'menos dez reais');
  });
  test('número', () => {
    assert.equal(porExtenso(-21, NUMBER_MODE), 'menos vinte e um');
    assert.equal(porExtenso(-21, FEMININE), 'menos vinte e uma');
    assert.equal(porExtenso('-2,5', NUMBER_MODE), 'menos dois vírgula cinco');
  });
  test('zero nunca é negativo', () => {
    assert.equal(porExtenso(-0), 'zero reais');
    assert.equal(porExtenso('-0', NUMBER_MODE), 'zero');
    assert.equal(porExtenso('-0,001'), 'zero reais');
    assert.equal(porExtenso('-0,00', NUMBER_MODE), 'zero');
  });
});

describe('BigInt', () => {
  test('valores grandes sem perda de precisão', () => {
    assert.equal(porExtenso(1n), 'um real');
    assert.equal(porExtenso(-5n), 'menos cinco reais');
    assert.equal(porExtenso(10n ** 15n), 'um quatrilhão de reais');
    assert.equal(
      porExtenso(123_456_789_012_345_678n, NUMBER_MODE),
      'cento e vinte e três quatrilhões quatrocentos e cinquenta e seis trilhões ' +
        'setecentos e oitenta e nove bilhões e doze milhões trezentos e quarenta e cinco mil ' +
        'seiscentos e setenta e oito',
    );
  });
  test('acima de 999 quatrilhões', () => {
    assert.throws(() => porExtenso(10n ** 18n), RangeError);
    assert.throws(() => porExtenso('1000000000000000000', NUMBER_MODE), RangeError);
    assert.throws(() => porExtenso('999.999.999.999.999.999,995'), RangeError);
  });
});

describe('formatos de string', () => {
  const expected = 'mil duzentos e trinta e quatro reais e cinquenta e seis centavos';
  for (const input of ['1.234,56', '1234,56', '1234.56', '1,234.56', 'R$ 1.234,56', 'R$1234,56', '  1.234,56  ', 'R$\u00a01.234,56']) {
    test(`"${input}"`, () => assert.equal(porExtenso(input), expected));
  }
  test('um único ponto seguido de três dígitos é separador de milhar', () => {
    assert.equal(porExtenso('1.500'), 'mil e quinhentos reais');
    assert.equal(porExtenso('1.5'), 'um real e cinquenta centavos');
    assert.equal(porExtenso('0.500'), 'cinquenta centavos');
    assert.equal(porExtenso('1234.567', NUMBER_MODE), 'mil duzentos e trinta e quatro vírgula quinhentos e sessenta e sete');
  });
  test('várias vírgulas são separadores de milhar', () => {
    assert.equal(porExtenso('1,000,000'), 'um milhão de reais');
  });
  test('separador sem parte inteira ou sem decimais', () => {
    assert.equal(porExtenso(',5'), 'cinquenta centavos');
    assert.equal(porExtenso('5,'), 'cinco reais');
    assert.equal(porExtenso('007'), 'sete reais');
  });
  test('arredondamento para centavos', () => {
    assert.equal(porExtenso('0,005'), 'um centavo');
    assert.equal(porExtenso('0,0049'), 'zero reais');
    assert.equal(porExtenso('0,999'), 'um real');
    assert.equal(porExtenso('999.999,999'), 'um milhão de reais');
  });
});

describe('number sem erros de ponto flutuante', () => {
  test('ruído binário é descartado', () => {
    assert.equal(porExtenso(0.1 + 0.2), 'trinta centavos');
    assert.equal(porExtenso(0.1 + 0.2, NUMBER_MODE), 'zero vírgula três');
    assert.equal(porExtenso(1.005), 'um real e um centavo');
    assert.equal(porExtenso(2.675), 'dois reais e sessenta e oito centavos');
    assert.equal(porExtenso(19.99), 'dezenove reais e noventa e nove centavos');
    assert.equal(porExtenso(1e-7, NUMBER_MODE), 'zero vírgula zero zero zero zero zero zero um');
  });
  test('inteiros grandes demais para number', () => {
    assert.throws(() => porExtenso(2 ** 60), RangeError);
    assert.equal(porExtenso(Number.MAX_SAFE_INTEGER, NUMBER_MODE).startsWith('nove quatrilhões'), true);
  });
});

describe('entradas inválidas', () => {
  for (const input of [null, undefined, true, {}, [], () => 1, Symbol('x')]) {
    test(`tipo ${typeof input} (${String(input === null ? 'null' : typeof input)})`, () => {
      assert.throws(() => porExtenso(input), TypeError);
    });
  }
  for (const input of [NaN, Infinity, -Infinity]) {
    test(`${input}`, () => assert.throws(() => porExtenso(input), TypeError));
  }
  for (const input of ['', '   ', 'abc', 'R$', '-', '12a', '1.23,45', '12,34,5', '1..2', '1,2.3,4', '--5', '1 234', '1e3', '+-1']) {
    test(`string "${input}"`, () => {
      assert.throws(() => porExtenso(input), (error) => error instanceof TypeError && /Valor inválido/.test(error.message));
    });
  }
  test('opções inválidas', () => {
    assert.throws(() => porExtenso(1, { modo: 'romano' }), /Modo inválido/);
    assert.throws(() => porExtenso(1, { genero: 'neutro' }), /Gênero inválido/);
    assert.throws(() => porExtenso(1, 'numero'), TypeError);
  });
});

describe('ordinal', () => {
  const table = [
    [1, 'primeiro'],
    [2, 'segundo'],
    [3, 'terceiro'],
    [4, 'quarto'],
    [5, 'quinto'],
    [6, 'sexto'],
    [7, 'sétimo'],
    [8, 'oitavo'],
    [9, 'nono'],
    [10, 'décimo'],
    [11, 'décimo primeiro'],
    [12, 'décimo segundo'],
    [20, 'vigésimo'],
    [23, 'vigésimo terceiro'],
    [30, 'trigésimo'],
    [40, 'quadragésimo'],
    [50, 'quinquagésimo'],
    [60, 'sexagésimo'],
    [70, 'septuagésimo'],
    [80, 'octogésimo'],
    [90, 'nonagésimo'],
    [100, 'centésimo'],
    [101, 'centésimo primeiro'],
    [111, 'centésimo décimo primeiro'],
    [200, 'ducentésimo'],
    [300, 'trecentésimo'],
    [400, 'quadringentésimo'],
    [500, 'quingentésimo'],
    [600, 'sexcentésimo'],
    [700, 'septingentésimo'],
    [800, 'octingentésimo'],
    [900, 'nongentésimo'],
    [999, 'nongentésimo nonagésimo nono'],
  ];
  for (const [n, expected] of table) {
    test(`${n}º → ${expected}`, () => assert.equal(ordinal(n), expected));
  }
  test('feminino', () => {
    assert.equal(ordinal(1, 'feminino'), 'primeira');
    assert.equal(ordinal(23, 'feminino'), 'vigésima terceira');
    assert.equal(ordinal(100, 'feminino'), 'centésima');
    assert.equal(ordinal(342, { genero: 'feminino' }), 'trecentésima quadragésima segunda');
  });
  test('aceita string e BigInt', () => {
    assert.equal(ordinal('23'), 'vigésimo terceiro');
    assert.equal(ordinal('23º'), 'vigésimo terceiro');
    assert.equal(ordinal(' 1ª ', 'feminino'), 'primeira');
    assert.equal(ordinal(5n), 'quinto');
  });
  test('fora do intervalo ou inválido', () => {
    for (const n of [0, 1000, -1, 1.5, 10n ** 20n]) assert.throws(() => ordinal(n), RangeError);
    for (const n of ['abc', '', null, undefined, {}]) assert.throws(() => ordinal(n), TypeError);
    assert.throws(() => ordinal(1, 'neutro'), /Gênero inválido/);
  });
});

describe('porcentagem', () => {
  test('exemplos', () => {
    assert.equal(porcentagem('12,5'), 'doze vírgula cinco por cento');
    assert.equal(porcentagem('12,5%'), 'doze vírgula cinco por cento');
    assert.equal(porcentagem(' 100 % '), 'cem por cento');
    assert.equal(porcentagem(1), 'um por cento');
    assert.equal(porcentagem('0,5'), 'zero vírgula cinco por cento');
    assert.equal(porcentagem(-3), 'menos três por cento');
    assert.equal(porcentagem(14, { catorze: true }), 'catorze por cento');
    assert.equal(porcentagem(2.25), 'dois vírgula vinte e cinco por cento');
  });
  test('inválida', () => {
    assert.throws(() => porcentagem('doze'), TypeError);
  });
});
