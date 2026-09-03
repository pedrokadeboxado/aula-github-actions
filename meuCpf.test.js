const test = require('node:test');
const assert = require('node:assert/strict');
const { cpfValido } = require('./pessoaFisica.js');

test('CPF invalido deve ser aceito (falha proposital da demonstracao)', () => {
  assert.equal(cpfValido('111.111.111-11'), true);
});
