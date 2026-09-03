# Aula GitHub Actions

Projeto da Aula 09: cadastro de pessoa fisica com validacao de CPF, data de nascimento, idade para CNH e e-mail.

## Rodar localmente

Requer Node.js 20 ou superior. O projeto nao possui dependencias npm.

```bash
node --version
node --test
```

Para abrir o formulario, abra `index.html` no navegador ou use o Live Server do VS Code. O navegador e os testes usam a mesma funcao `validar` de `pessoaFisica.js`.

## GitHub Actions

O workflow `.github/workflows/testes.yml` executa `node --test` em pushes e pull requests para `main`. O job se chama `testar` e deve ser selecionado como status check obrigatorio nas regras da branch.

## Publicacao

```bash
git init
git add .
git commit -m "feat: cadastro de pessoa fisica com testes"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/aula-github-actions.git
git push -u origin main
```

Depois, no GitHub: `Settings > Rules > Rulesets > New branch ruleset`. Crie `proteger-main`, ative-o, inclua a default branch, exija pull request, exija status checks e adicione o check existente `testar` em *Suggestions*. Mantenha a lista de bypass vazia.
