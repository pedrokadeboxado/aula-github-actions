const test = require('node:test');
const assert = require('node:assert/strict');
const { mock } = require('node:test');
const { validar, garantirValido, DadosInvalidosError, cpfValido } = require('./pessoaFisica.js');
const { cadastrar } = require('./cadastroService.js');

const HOJE = new Date(2026, 7, 21);

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
  assert.deepEqual(validar({ data_nascimento: '2030-01-01' }, HOJE).filter((erro) => erro.startsWith('data_nascimento')), ['data_nascimento: nao pode estar no futuro']);
});

test('nao permite CNH para menor de 18 anos', () => {
  const erros = validar({ data_nascimento: '2015-01-01', possui_cnh: true }, HOJE);
  assert.ok(erros.includes('possui_cnh: so a partir de 18 anos'));
});

test('rejeita e-mail invalido', () => {
  assert.deepEqual(validar({ email: 'sem-arroba' }).filter((erro) => erro.startsWith('email')), ['email: invalido']);
});

test('faz 18 anos hoje e pode ter CNH', () => {
  assert.deepEqual(validar({
    nome: 'Joao Pedro Lima',
    cpf: '529.982.247-25',
    data_nascimento: '2008-08-21',
    email: 'joao@escola.com',
    possui_cnh: true
  }, HOJE), []);
});

test('garantirValido levanta erro com a lista de problemas', () => {
  assert.throws(
    () => garantirValido({ cpf: '111.111.111-11' }, HOJE),
    (erro) => erro instanceof DadosInvalidosError && erro.erros.includes('cpf: invalido')
  );
});

test('cadastro valido salva e notifica uma vez', async () => {
  const repositorio = { salvar: mock.fn(async (pessoa) => ({ id: 1, ...pessoa })) };
  const notificador = { enviar: mock.fn(async () => {}) };
  const pessoa = { nome: 'Ana Maria Souza', cpf: '529.982.247-25', data_nascimento: '1998-03-14', email: 'ana@example.com', possui_cnh: false };

  const salvo = await cadastrar(pessoa, { repositorio, notificador, hoje: HOJE });

  assert.equal(salvo.id, 1);
  assert.equal(repositorio.salvar.mock.callCount(), 1);
  assert.equal(notificador.enviar.mock.callCount(), 1);
});

test('cadastro invalido nao salva nem notifica', async () => {
  const repositorio = { salvar: mock.fn() };
  const notificador = { enviar: mock.fn() };

  await assert.rejects(() => cadastrar({ cpf: '111.111.111-11' }, { repositorio, notificador, hoje: HOJE }), DadosInvalidosError);

  assert.equal(repositorio.salvar.mock.callCount(), 0);
  assert.equal(notificador.enviar.mock.callCount(), 0);
});
