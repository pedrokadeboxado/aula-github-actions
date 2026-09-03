// Validadores do cadastro de Pessoa Física — Aula 08
// Regras: nome, cpf, email, data_nascimento, possui_cnh

const FORMATO_EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const FORMATO_NOME = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;
const IDADE_MINIMA_CNH = 18;
const IDADE_MAXIMA = 120;

const soDigitos = (texto) => (texto ?? '').toString().replace(/\D/g, '');

function cpfValido(cpf) {
  const numeros = soDigitos(cpf);
  if (numeros.length !== 11) return false;
  if (numeros === numeros[0].repeat(11)) return false;
  for (const quantidade of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < quantidade; i++) soma += Number(numeros[i]) * (quantidade + 1 - i);
    const digito = ((soma * 10) % 11) % 10;
    if (digito !== Number(numeros[quantidade])) return false;
  }
  return true;
}

function nomeValido(nome) {
  const texto = (nome ?? '').toString().trim();
  if (texto.length < 3 || texto.length > 80) return false;
  if (!FORMATO_NOME.test(texto)) return false;
  const palavras = texto.split(/\s+/).filter((p) => p.replace(/['-]/g, '').length >= 2);
  return palavras.length >= 2;
}

function emailValido(email) {
  return FORMATO_EMAIL.test((email ?? '').toString().trim());
}

// Devolve a data como objeto {ano, mes, dia} se for válida, ou null
function dataNascimentoValida(texto, hoje) {
  if (!FORMATO_DATA.test((texto ?? '').toString())) return null;
  const [ano, mes, dia] = texto.split('-').map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  // 30/02 vira 01/03: se algum campo mudou, a data não existe
  if (data.getUTCFullYear() !== ano || data.getUTCMonth() !== mes - 1 || data.getUTCDate() !== dia) return null;
  return { ano, mes, dia };
}

// Idade comparando ano, mês e dia — NUNCA (hoje - nascimento) / 365
function idadeEm(nascimento, hoje) {
  let idade = hoje.getUTCFullYear() - nascimento.ano;
  const aniversarioPassou =
    hoje.getUTCMonth() + 1 > nascimento.mes ||
    (hoje.getUTCMonth() + 1 === nascimento.mes && hoje.getUTCDate() >= nascimento.dia);
  if (!aniversarioPassou) idade -= 1;
  return idade;
}

// Devolve a LISTA de erros (vazia = tudo certo). Não levanta exceção.
function validar(pessoa, hoje = new Date()) {
  const erros = [];

  if (!nomeValido(pessoa.nome)) erros.push('nome: informe nome e sobrenome (3 a 80 letras)');

  if (!cpfValido(pessoa.cpf)) erros.push('cpf: invalido');

  if (!emailValido(pessoa.email)) erros.push('email: invalido');

  const nascimento = dataNascimentoValida(pessoa.data_nascimento, hoje);
  let idade = null;
  if (!nascimento) {
    erros.push('data_nascimento: use o formato AAAA-MM-DD com uma data que existe');
  } else {
    idade = idadeEm(nascimento, hoje);
    if (idade < 0) erros.push('data_nascimento: nao pode estar no futuro');
    else if (idade > IDADE_MAXIMA) erros.push('data_nascimento: idade acima de 120 anos');
  }

  if (typeof pessoa.possui_cnh !== 'boolean') {
    erros.push('possui_cnh: informe true ou false');
  } else if (pessoa.possui_cnh && idade !== null && idade >= 0 && idade < IDADE_MINIMA_CNH) {
    erros.push('possui_cnh: so a partir de 18 anos');
  }

  return erros;
}

class DadosInvalidosError extends Error {
  constructor(erros) {
    super(erros.join('; '));
    this.name = 'DadosInvalidosError';
    this.erros = erros;
  }
}

// Levanta a exceção quando continuar não faz sentido
function garantirValido(pessoa, hoje = new Date()) {
  const erros = validar(pessoa, hoje);
  if (erros.length) throw new DadosInvalidosError(erros);
  return true;
}

// No Node (para os testes com node --test); no navegador o script já expõe as funções
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { soDigitos, cpfValido, nomeValido, emailValido, dataNascimentoValida, idadeEm, validar, garantirValido, DadosInvalidosError };
}
