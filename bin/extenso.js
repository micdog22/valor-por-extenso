#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { porExtenso, ordinal, porcentagem } from '../src/index.js';

const HELP = `Uso: extenso [opções] [valor ...]

Escreve números e valores em reais por extenso, em português do Brasil.

Exemplos:
  extenso 1234,56                  mil duzentos e trinta e quatro reais e cinquenta e seis centavos
  extenso --numero 21 --feminino   vinte e uma
  extenso --ordinal 23             vigésimo terceiro
  extenso --porcentagem 12,5       doze vírgula cinco por cento
  echo "1.500.000" | extenso       um milhão e quinhentos mil reais

Opções:
  -n, --numero        escreve como número, sem moeda
  -o, --ordinal       escreve o ordinal (de 1 a 999)
  -p, --porcentagem   escreve como porcentagem
  -f, --feminino      usa o feminino em números e ordinais (uma, duas, duzentas)
      --catorze       usa a grafia "catorze" em vez de "quatorze"
  -h, --help          mostra esta ajuda
  -v, --version       mostra a versão

Sem valores na linha de comando, lê um valor por linha da entrada padrão.
Valores negativos podem ser passados direto: extenso -10,50`;

function packageVersion() {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  return pkg.version;
}

function main(argv) {
  const options = { modo: 'monetario', genero: 'masculino', catorze: false };
  let kind = 'value';
  const values = [];
  let onlyValues = false;

  for (const arg of argv) {
    // "-10,50" é um valor negativo, não uma opção
    if (onlyValues || !arg.startsWith('-') || /^[-\u2212][\d.,]/.test(arg)) {
      values.push(arg);
      continue;
    }
    switch (arg) {
      case '--':
        onlyValues = true;
        break;
      case '-n':
      case '--numero':
        options.modo = 'numero';
        break;
      case '-o':
      case '--ordinal':
      case '-p':
      case '--porcentagem': {
        const next = arg === '-o' || arg === '--ordinal' ? 'ordinal' : 'percent';
        if (kind !== 'value' && kind !== next) {
          console.error('extenso: use --ordinal ou --porcentagem, não os dois.');
          return 2;
        }
        kind = next;
        break;
      }
      case '-f':
      case '--feminino':
        options.genero = 'feminino';
        break;
      case '--catorze':
        options.catorze = true;
        break;
      case '-h':
      case '--help':
        console.log(HELP);
        return 0;
      case '-v':
      case '--version':
        console.log(packageVersion());
        return 0;
      default:
        console.error(`extenso: opção desconhecida: ${arg}\nUse "extenso --help" para ver as opções.`);
        return 2;
    }
  }

  let inputs = values;
  if (inputs.length === 0) {
    if (process.stdin.isTTY) {
      console.error(HELP);
      return 2;
    }
    inputs = readFileSync(0, 'utf8').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  }

  const convert = (text) => {
    if (kind === 'ordinal') return ordinal(text, options.genero);
    if (kind === 'percent') return porcentagem(text, { catorze: options.catorze });
    return porExtenso(text, options);
  };

  let exitCode = 0;
  for (const text of inputs) {
    try {
      console.log(convert(text));
    } catch (error) {
      console.error(`extenso: ${error.message}`);
      exitCode = 1;
    }
  }
  return exitCode;
}

process.exitCode = main(process.argv.slice(2));
