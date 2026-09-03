const { garantirValido } = require('./pessoaFisica.js');

async function cadastrar(pessoa, { repositorio, notificador, hoje = new Date() }) {
  garantirValido(pessoa, hoje);
  const salvo = await repositorio.salvar(pessoa);
  await notificador.enviar(`Cadastro de ${pessoa.nome} concluido`);
  return salvo;
}

module.exports = { cadastrar };