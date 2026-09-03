function somenteDigitos(valor) {
  return String(valor ?? '').replace(/\D/g, '');
}

function cpfValido(valor) {
  const cpf = somenteDigitos(valor);

  if (cpf.length !== 11 || /^([0-9])\1{10}$/.test(cpf)) {
    return false;
  }

  let soma = 0;
  for (let indice = 0; indice < 9; indice += 1) {
    soma += Number(cpf[indice]) * (10 - indice);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(cpf[9])) return false;

  soma = 0;
  for (let indice = 0; indice < 10; indice += 1) {
    soma += Number(cpf[indice]) * (11 - indice);
  }
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === Number(cpf[10]);
}

function dataValida(valor) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(valor ?? ''))) return false;
  const [ano, mes, dia] = valor.split('-').map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  return data.getUTCFullYear() === ano && data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia;
}

function idadeEmAnos(dataNascimento, hoje = new Date()) {
  const [ano, mes, dia] = dataNascimento.split('-').map(Number);
  let idade = hoje.getFullYear() - ano;
  const aniversarioAindaNaoChegou = hoje.getMonth() + 1 < mes || (hoje.getMonth() + 1 === mes && hoje.getDate() < dia);
  if (aniversarioAindaNaoChegou) idade -= 1;
  return idade;
}

function validar(pessoa) {
  const erros = [];
  const nome = String(pessoa?.nome ?? '').trim();
  const cpf = String(pessoa?.cpf ?? '').trim();
  const dataNascimento = String(pessoa?.data_nascimento ?? '').trim();
  const email = String(pessoa?.email ?? '').trim();
  const possuiCnh = Boolean(pessoa?.possui_cnh);

  if (!nome) erros.push('nome: e obrigatorio');
  if (!cpf) erros.push('cpf: e obrigatorio');
  else if (!cpfValido(cpf)) erros.push('cpf: invalido');
  if (!dataNascimento) erros.push('data_nascimento: e obrigatoria');
  else if (!dataValida(dataNascimento)) erros.push('data_nascimento: invalida');
  else {
    const hoje = new Date();
    const nascimento = new Date(`${dataNascimento}T00:00:00`);
    if (nascimento > hoje) erros.push('data_nascimento: nao pode estar no futuro');
    else if (possuiCnh && idadeEmAnos(dataNascimento, hoje) < 18) erros.push('possui_cnh: so a partir de 18 anos');
  }
  if (!email) erros.push('email: e obrigatorio');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erros.push('email: invalido');

  return erros;
}

if (typeof module !== 'undefined') {
  module.exports = { validar, cpfValido, dataValida, idadeEmAnos };
}
