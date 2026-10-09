# Valor por Extenso — números e valores em reais escritos por extenso (JavaScript • Node.js)

Biblioteca sem dependências para escrever números e valores em reais por extenso, em português do Brasil, do jeito que se escreve em cheques, recibos, notas promissórias e contratos. Também escreve ordinais ("vigésimo terceiro") e porcentagens ("doze vírgula cinco por cento"). Acompanha uma linha de comando e uma página de demonstração.

**Demonstração online:** https://micdog22.github.io/valor-por-extenso/

## Recursos

- Regras do português aplicadas de verdade: "cem" e "cento e …", "mil" (nunca "um mil"), "mil e duzentos" mas "mil duzentos e cinquenta", "um milhão de reais".
- Modo monetário (padrão) e modo número, com feminino: "vinte e uma", "duzentas mil".
- Grafia "quatorze" (padrão) ou "catorze".
- Moeda personalizável (singular e plural), negativos ("menos …") e inteiros até 999 quatrilhões.
- Entrada como `number`, `bigint` ou `string`, nos formatos brasileiro ("1.234,56") e internacional ("1234.56"), com ou sem "R$".
- Conta feita com inteiros (BigInt) sobre o texto: nada de erro de ponto flutuante.
- Ordinais de 1 a 999 e porcentagens.
- CLI `extenso`, que também lê valores da entrada padrão.

## Instalação

```bash
npm install github:micdog22/valor-por-extenso
```

## Como usar

```js
import { porExtenso, ordinal, porcentagem } from 'valor-por-extenso';

porExtenso('1.234,56');
// 'mil duzentos e trinta e quatro reais e cinquenta e seis centavos'

porExtenso(1_500_000);      // 'um milhão e quinhentos mil reais'
porExtenso('2.000.000,10'); // 'dois milhões de reais e dez centavos'
porExtenso(0.5);            // 'cinquenta centavos'
porExtenso(-1.01);          // 'menos um real e um centavo'
porExtenso(10n ** 15n);     // 'um quatrilhão de reais'

porExtenso(21, { modo: 'numero', genero: 'feminino' }); // 'vinte e uma'
porExtenso('12,5', { modo: 'numero' });                  // 'doze vírgula cinco'
porExtenso(14, { modo: 'numero', catorze: true });       // 'catorze'

porExtenso('10,50', { moeda: { singular: 'dólar', plural: 'dólares' } });
// 'dez dólares e cinquenta centavos'

ordinal(23);              // 'vigésimo terceiro'
ordinal(100, 'feminino'); // 'centésima'
porcentagem('12,5');      // 'doze vírgula cinco por cento'
```

### Opções de `porExtenso(valor, opcoes)`

| Opção | Valores | Padrão |
| --- | --- | --- |
| `modo` | `'monetario'` ou `'numero'` | `'monetario'` |
| `genero` | `'masculino'` ou `'feminino'` (vale para o modo número) | `'masculino'` |
| `catorze` | `true` escreve "catorze"; `false`, "quatorze" | `false` |
| `moeda` | `{ singular, plural, genero? }` | `{ singular: 'real', plural: 'reais' }` |
| `centavos` | `{ singular, plural, genero? }` | `{ singular: 'centavo', plural: 'centavos' }` |

No modo monetário o gênero vem da moeda: `{ singular: 'libra', plural: 'libras', genero: 'feminino' }` gera "duas libras".

### Entradas aceitas

- `number`: no modo monetário é arredondado para centavos (meio para cima). Inteiros acima de `Number.MAX_SAFE_INTEGER` são recusados; para eles, use `bigint` ou `string`.
- `bigint`: inteiros de qualquer tamanho até 999.999.999.999.999.999 (constante `VALOR_MAXIMO`).
- `string`: "1.234,56", "1234,56", "1234.56", "1,234.56", "R$ 1.234,56", "-R$ 10,00". Com ponto e vírgula, o último separador é o decimal. Um único ponto seguido de exatamente três dígitos é lido como milhar, como no Brasil: "1.500" é mil e quinhentos.

Valores inválidos lançam `TypeError` e valores fora do limite lançam `RangeError`, sempre com mensagem em português.

### Linha de comando

```bash
npx extenso 1234,56
# mil duzentos e trinta e quatro reais e cinquenta e seis centavos

npx extenso --numero 21 --feminino
# vinte e uma

npx extenso --ordinal 23
# vigésimo terceiro

npx extenso --porcentagem 12,5
# doze vírgula cinco por cento

printf '10\n0,01\n1.000.000\n' | npx extenso
# dez reais
# um centavo
# um milhão de reais
```

Opções: `--numero`, `--ordinal`, `--porcentagem`, `--feminino`, `--catorze`, `--help` e `--version`. Sem valores na linha de comando, a CLI lê um valor por linha da entrada padrão. O código de saída é 0 quando tudo deu certo, 1 quando algum valor é inválido e 2 em erro de uso.

## Como rodar localmente

```bash
node bin/extenso.js 1234,56
```

Para abrir a página de demonstração, sirva a pasta do projeto e acesse http://localhost:8000 (módulos ES não carregam via `file://`):

```bash
python3 -m http.server 8000
```

## Testes

```bash
npm test
```

## Como funciona

O número é separado em classes de três dígitos (unidades, mil, milhão, bilhão, trilhão, quatrilhão), na escala curta usada no Brasil. As regras aplicadas:

- 100 é "cem"; de 101 a 199 usa-se "cento e …". Centenas, dezenas e unidades são ligadas por "e".
- Entre as classes, o "e" só aparece quando a classe seguinte é menor que 100 ou uma centena redonda: "mil e duzentos", "mil e noventa e nove", "dois milhões e trezentos mil", mas "mil duzentos e cinquenta".
- Milhão, bilhão etc. são substantivos masculinos, então continuam no masculino mesmo no feminino: "dois milhões e duzentas mil".
- Valores com milhões, bilhões etc. exatos levam "de" antes da moeda: "um milhão de reais", "um bilhão e quinhentos milhões de reais", mas "um milhão e quinhentos mil reais".
- No modo número, a parte decimal com até três casas é lida como número ("doze vírgula vinte e cinco"); com mais casas, dígito a dígito ("três vírgula um quatro um cinco nove").

## Contribuindo

Issues e pull requests são bem-vindos.

## Licença

MIT — veja [LICENSE](LICENSE).
