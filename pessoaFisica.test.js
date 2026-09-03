// Suíte de testes unitários — Aula 08
// Rodar com: node --test

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { validar, garantirValido, cpfValido, DadosInvalidosError } = require('./pessoaFisica');

// O "relógio" injetado: o teste não depende do dia real
const HOJE = new Date(Date.UTC(2026, 7, 28)); // 2026-08-28

// Fábrica: cadastro válido; cada teste muda só o campo que quer testar
const pessoa = (mudancas = {}) => ({
  nome: 'Ana Maria Souza',
  cpf: '529.982.247-25',
  email: 'ana.souza@escola.com.br',
  data_nascimento: '1998-03-14',
  possui_cnh: true,
  ...mudancas,
});

const temErro = (erros, trecho) => erros.some((e) => e.includes(trecho));

// 1) A LINHA RETA — se este falha, nada mais importa
test('caminho feliz: cadastro completo e valido', () => {
  assert.deepEqual(validar(pessoa(), HOJE), []);
});

// 2) UM CASO DE BORDA POR CAMPO
describe('nome', () => {
  for (const [nome, motivo] of [
    ['', 'vazio'],
    ['Al', 'curto demais'],
    ['A'.repeat(81) + ' Souza', 'longo demais'],
    ['Ana', 'so o primeiro nome'],
    ['Ana Souza 3', 'numero no nome'],
  ]) {
    test(`invalido: ${JSON.stringify(nome.slice(0, 20))} (${motivo})`, () => {
      assert.ok(temErro(validar(pessoa({ nome }), HOJE), 'nome'));
    });
  }

  test("valido: hifen e apostrofo — Ana-Clara D'Avila Souza", () => {
    assert.deepEqual(validar(pessoa({ nome: "Ana-Clara D'Avila Souza" }), HOJE), []);
  });
});

describe('cpf', () => {
  for (const cpf of ['111.111.111-11', '529.982.247-24', '5299822472', '', null]) {
    test(`invalido: ${JSON.stringify(cpf)}`, () => {
      assert.equal(cpfValido(cpf), false);
    });
  }

  test('valido: com ou sem mascara', () => {
    assert.equal(cpfValido('529.982.247-25'), true);
    assert.equal(cpfValido('52998224725'), true);
  });
});

describe('email', () => {
  for (const email of ['x', 'sem-arroba.com', 'a@b', 'a b@c.com', '@dominio.com']) {
    test(`invalido: ${JSON.stringify(email)}`, () => {
      assert.ok(temErro(validar(pessoa({ email }), HOJE), 'email'));
    });
  }
});

describe('data_nascimento', () => {
  for (const [data, motivo] of [
    ['14/03/1998', 'formato errado'],
    ['1998-02-30', 'dia que nao existe'],
    ['2030-01-01', 'no futuro'],
    ['1900-01-01', 'mais de 120 anos'],
    ['', 'vazia'],
  ]) {
    test(`invalido: ${JSON.stringify(data)} (${motivo})`, () => {
      assert.ok(temErro(validar(pessoa({ data: undefined, data_nascimento: data }), HOJE), 'data_nascimento'));
    });
  }
});

describe('possui_cnh', () => {
  for (const valor of ['sim', 1, 'true', null]) {
    test(`tipo errado: ${JSON.stringify(valor)}`, () => {
      assert.ok(temErro(validar(pessoa({ possui_cnh: valor }), HOJE), 'possui_cnh'));
    });
  }
});

// 3) AS FRONTEIRAS — é no limite exato que o bug mora
test('faz 18 anos exatamente hoje: pode ter CNH', () => {
  assert.deepEqual(validar(pessoa({ data_nascimento: '2008-08-28', possui_cnh: true }), HOJE), []);
});

test('faz 18 anos amanha: ainda nao pode', () => {
  const erros = validar(pessoa({ data_nascimento: '2008-08-29', possui_cnh: true }), HOJE);
  assert.ok(temErro(erros, 'possui_cnh: so a partir de 18 anos'));
});

test('menor de 18 sem CNH: valido', () => {
  assert.deepEqual(validar(pessoa({ data_nascimento: '2010-01-05', possui_cnh: false }), HOJE), []);
});

// 4) A COMBINAÇÃO — devolve TODOS os erros de uma vez, não só o primeiro
test('acumula todos os erros de uma vez', () => {
  const erros = validar(
    { nome: 'Al', cpf: '123', email: 'x', data_nascimento: '2030-01-01', possui_cnh: 'sim' },
    HOJE,
  );
  assert.ok(erros.length >= 5, `esperava 5+ erros, veio: ${JSON.stringify(erros)}`);
});

// 5) A EXCEÇÃO — o outro contrato do módulo
test('garantirValido lanca a excecao com a lista dentro', () => {
  assert.throws(
    () => garantirValido(pessoa({ cpf: '111.111.111-11' }), HOJE),
    (erro) => erro instanceof DadosInvalidosError && erro.erros.includes('cpf: invalido'),
  );
});

test('garantirValido devolve true quando tudo certo', () => {
  assert.equal(garantirValido(pessoa(), HOJE), true);
});

