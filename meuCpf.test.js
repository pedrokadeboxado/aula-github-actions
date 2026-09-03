const test = require('node:test');
const assert = require('node:assert/strict');
const { cpfValido } = require('./pessoaFisica.js');

test('rejeita CPF invalido', () => {
  assert.equal(cpfValido('111.111.111-11'), false);
});
