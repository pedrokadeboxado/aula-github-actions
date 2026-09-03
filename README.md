# Aula — Testes Unitários e GitHub Actions

Validação de cadastro de Pessoa Física com suíte de testes unitários — material das
Aulas 08 e 09 de Desenvolvimento de Sistemas para Web/Mobile IV (Engenharia de
Software — UGV, Prof. Marcos Nielsen).

## O que tem aqui

| Arquivo | Papel |
|---|---|
| `pessoaFisica.js` | Os validadores (código sob teste): nome, CPF, e-mail, data de nascimento e CNH |
| `pessoaFisica.test.js` | A suíte de testes unitários (runner nativo do Node) |
| `index.html` | Página com o formulário de cadastro usando os mesmos validadores |

## As regras do cadastro

| Campo | Regra |
|---|---|
| `nome` | obrigatório; 3 a 80 caracteres; nome e sobrenome; só letras, espaço, apóstrofo e hífen |
| `cpf` | 11 dígitos (aceita máscara); não pode ter todos os dígitos iguais; dígitos verificadores corretos |
| `email` | uma `@`, algo antes, domínio com ponto, sem espaços |
| `data_nascimento` | formato `AAAA-MM-DD`; data que existe; não futura; até 120 anos |
| `possui_cnh` | booleano de verdade; se `true`, idade >= 18 (comparando ano, mês e dia) |

## Como rodar os testes

Requisito: Node 18+ (sem `npm install` — o runner e os asserts são nativos).

```bash
node --test
```

A suíte cobre: o caminho feliz, um caso de borda por campo, as duas fronteiras dos
18 anos (faz 18 hoje pode; faz 18 amanhã não pode), a acumulação de todos os erros
de uma vez e o contrato da exceção (`DadosInvalidosError`).

## Como usar a página

Abra o `index.html` no navegador. O formulário chama `validar()` e mostra todos os
erros de uma vez (o contrato do 400) ou a mensagem de cadastro válido.
