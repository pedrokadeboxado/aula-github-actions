const test = require('node:test');
const assert = require('node:assert/strict');
const { validar, cpfValido } = require('./pessoaFisica.js');

test('aceita um cadastro completo e valido', () => {
  const erros = validar({
    nome: 'Ana Maria Souza',
    cpf: '529.982.247-25',
    data_nascimento: '1998-03-14',
    email: 'ana@example.com',
    possui_cnh: false
  });

  assert.deepEqual(erros, []);
});

test('rejeita o formulario vazio com todos os erros', () => {
  assert.deepEqual(validar({}), [
    'nome: e obrigatorio',
    'cpf: e obrigatorio',
    'data_nascimento: e obrigatoria',
    'email: e obrigatorio'
  ]);
});

test('rejeita CPF invalido', () => {
  assert.equal(cpfValido('111.111.111-11'), false);
  assert.deepEqual(validar({ cpf: '111.111.111-11' }).filter((erro) => erro.startsWith('cpf')), ['cpf: invalido']);
});

test('rejeita data de nascimento no futuro', () => {
  assert.deepEqual(validar({ data_nascimento: '2030-01-01' }).filter((erro) => erro.startsWith('data_nascimento')), ['data_nascimento: nao pode estar no futuro']);
});

test('nao permite CNH para menor de 18 anos', () => {
  const erros = validar({ data_nascimento: '2015-01-01', possui_cnh: true });
  assert.ok(erros.includes('possui_cnh: so a partir de 18 anos'));
});

test('rejeita e-mail invalido', () => {
  assert.deepEqual(validar({ email: 'sem-arroba' }).filter((erro) => erro.startsWith('email')), ['email: invalido']);
});
