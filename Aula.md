# Roteiro — Aula 09: CI com GitHub Actions
Cadastro de Pessoa Física (validadores da Aula 08)

---

## 1. Criar o repositório público

1. GitHub → botão **New repository**
2. Nome: `aula-github-actions`
3. Visibilidade: **Public**
4. Marcar **Add a README file**
5. **Create repository**

---

## 2. Inicializar o projeto na máquina

```bash
git clone https://github.com/SEU-USUARIO/aula-github-actions.git
cd aula-github-actions
```

Copiar para a raiz os arquivos da Aula 08:

```
aula-github-actions/
├── README.md
├── index.html
├── pessoaFisica.js
└── pessoaFisica.test.js
```

Conferir que a suíte roda localmente (Node 20 ou superior):

```bash
node --version
node --test
```

Todos os testes devem passar. Não há `package.json` nem `npm install` — o projeto não tem dependências.

Primeiro commit:

```bash
git add .
git commit -m "feat: cadastro de pessoa fisica com testes"
git push
```

---

## 3. Criar o workflow

Estrutura de pastas (na raiz do repositório):

```
.github/
└── workflows/
    └── testes.yml
```

Atenção:
- `.github` com **ponto** no início
- `workflows` no **plural**
- Na raiz, no mesmo nível do `pessoaFisica.js`

No terminal:

```bash
mkdir -p .github/workflows
```

---

## 4. Escrever o YAML

Arquivo `.github/workflows/testes.yml`:

```yaml
name: Testes

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  testar:
    runs-on: ubuntu-latest
    steps:
      - name: Baixar o código
        uses: actions/checkout@v4

      - name: Instalar o Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Rodar a suíte
        run: node --test
```

Como ler:

| Bloco | O que faz |
|---|---|
| `name` | Nome do workflow (aparece na aba Actions) |
| `on` | Gatilhos: push na `main` e pull request para a `main` |
| `jobs.testar` | Nome do **job** — é este nome que entra na proteção de branch |
| `runs-on` | Máquina virtual Ubuntu fornecida pelo GitHub |
| `checkout` | Clona o repositório na máquina virtual |
| `setup-node` | Instala o Node 20 (o test runner nativo vem junto) |
| `node --test` | Descobre e roda `*.test.js` e `*_test.js` automaticamente |

Indentação: **2 espaços**, nunca tab.

Subir o workflow:

```bash
git add .github
git commit -m "feat: add workflow de teste"
git push
```

Abrir a aba **Actions** do repositório → a execução aparece sozinha. Não há nada para ativar: o GitHub Actions já vem ligado.

---

## 5. Mostrar uma execução verde e uma vermelha

**Verde:** a execução do passo anterior.

**Vermelha:** criar um teste que falha de propósito (ex.: `meuCpf.test.js` esperando `true` para um CPF inválido), commitar e dar push.

Observar na aba Actions:
- O X vermelho ao lado do commit
- **Mas o commit entrou na `main` mesmo assim**

Ponto da aula: o workflow sozinho é um **alarme**, não uma **tranca**. Ele avisa, mas não impede.

---

## 6. Proteger a branch main (Ruleset)

**Settings → Rules → Rulesets → New ruleset → New branch ruleset**

| Campo | Valor |
|---|---|
| Ruleset Name | `proteger-main` |
| Enforcement status | **Active** |
| Bypass list | **deixar vazia** (a regra vale até para o dono) |
| Target branches | Add target → **Include default branch** |

Em **Rules**, marcar:

- [x] **Require a pull request before merging**
- [x] **Require status checks to pass**
  - [x] Require branches to be up to date before merging
  - Add checks → digitar `testar` → escolher **`testar` — GitHub Actions** (em *Suggestions*)
  - **Não** escolher "Add Testar" (isso cria um check inexistente que nunca roda)
- [x] **Block force pushes** (já vem marcado)

Clicar em **Create**.

Conferir os três itens que fazem a regra bloquear de fato:
1. Enforcement = Active
2. Target = default branch
3. Require a pull request marcado

---

## 7. Mostrar que a main não aceita mais commit direto

Fazer qualquer alteração, commitar e tentar `git push` na `main`.

Resultado esperado:

```
remote: error: GH013: Repository rule violations found for refs/heads/main.
remote: - Changes must be made through a pull request.
remote: - Required status check "testar" is expected.
 ! [remote rejected] main -> main (push declined due to repository rule violations)
```

Ponto da aula: o push foi barrado **antes** de qualquer teste rodar. O GitHub nem olhou o código — bloqueou na porta.

---

## 8. Fluxo correto: só via pull request

O commit ficou na `main` local. Movê-lo para uma branch:

```bash
git checkout -b corrige-teste
git push -u origin corrige-teste
```

Abrir o link que o Git devolve:
`https://github.com/SEU-USUARIO/aula-github-actions/pull/new/corrige-teste`

Clicar em **Create pull request**.

Depois, alinhar a `main` local com a remota:

```bash
git checkout main
git reset --hard origin/main
```

---

## 9. Ver o teste rodar antes do merge e a rejeição

No PR, em segundos aparece o check **testar** no rodapé.

**Se ficar vermelho:**
- Botão **Merge** bloqueado, com a mensagem de check obrigatório falhando
- Clicar em **Details** ao lado do check → passo "Rodar a suíte" → o log mostra o nome do teste que falhou, o valor esperado e o recebido

**Corrigir:**
```bash
git checkout corrige-teste
# corrigir o teste
git commit -am "fix: corrige teste de cpf"
git push
```

O check reroda sozinho no mesmo PR. Verde → botão **Merge** libera.

Sequência que o aluno precisa enxergar:

```
push na branch → PR aberto → testar roda → vermelho: merge travado
                                          → verde: merge liberado → main atualizada
```

---

## 10. A página index.html com os validadores

O `index.html` carrega o **mesmo** `pessoaFisica.js` da suíte de testes: o formulário chama `validar(pessoa)` e mostra a lista de erros ou a mensagem de sucesso.

Para abrir:
- Clicar duas vezes no `index.html`, **ou**
- VS Code → extensão Live Server → *Open with Live Server*

Demonstrar no navegador:

| Entrada | Resultado |
|---|---|
| Formulário vazio | Lista com todos os erros de uma vez |
| CPF `111.111.111-11` | `cpf: invalido` |
| Data `2030-01-01` | `data_nascimento: nao pode estar no futuro` |
| Menor de 18 com CNH marcada | `possui_cnh: so a partir de 18 anos` |
| Ana Maria Souza / 529.982.247-25 / e-mail válido / 1998-03-14 | "Cadastro válido!" |

Ponto da aula: o mesmo módulo é validado por três caminhos — testes locais, CI no GitHub e o formulário no navegador. Regra escrita uma vez, verificada em todo lugar.

---

## Resumo em uma linha

> Workflow **avisa**, ruleset **tranca**, pull request é a **única porta**, e o check `testar` é a **chave**.
