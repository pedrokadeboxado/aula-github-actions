// O teste mais simples possível: um arquivo, um teste, um assert.
// Rodar com: node --test meuCpf.test.js

// 1. O RUNNER: quem executa o teste
const { test } = require('node:test');

// 2. O ASSERT: quem decide se passou ou falhou
const assert = require('node:assert/strict');

// 3. O CÓDIGO SOB TESTE: a função que queremos verificar
const { cpfValido } = require('./pessoaFisica');

test('teste de cpf invalido', () => {
  assert.equal(cpfValido('12345678912'), false);
});

test('teste de cpf invalido', () => {
  assert.equal(cpfValido('07144676008'), true);
});