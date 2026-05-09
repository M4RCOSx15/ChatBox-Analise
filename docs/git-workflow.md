# Guia: Code Review e Issues via terminal (gh CLI)

Este guia mostra como fazer **code review** e **abrir issues** usando o GitHub CLI (`gh`) no terminal, sem depender da interface web.

---

## Pré-requisitos

Instalar e autenticar uma única vez:

```powershell
# Instalar (Windows)
winget install GitHub.cli

# Logar (interativo, abre o navegador)
gh auth login

# Verificar autenticação
gh auth status
```

> No Linux/Mac use o gerenciador de pacotes da sua distro (`brew install gh`, `apt install gh`, etc).

---

# Parte 1: Code Review

Uma "review" no GitHub é uma decisão (aprovar, pedir mudanças ou só comentar) que pode vir junto com **comentários inline** em linhas específicas do diff.

## 1.1 Listar PRs abertos

```powershell
# Lista todos os PRs abertos
gh pr list

# Filtrar por autor
gh pr list --author miguelalchaar

# Ver detalhes de um PR específico
gh pr view 12

# Abrir o PR no navegador
gh pr view 12 --web
```

## 1.2 Ver os arquivos alterados

```powershell
# Lista nomes dos arquivos alterados
gh pr diff 12 --name-only

# Diff completo no terminal
gh pr diff 12

# Via API (mais detalhado, com adições/remoções por arquivo)
gh api repos/OWNER/REPO/pulls/12/files
```

## 1.3 Os 3 tipos de review

| Tipo | Comando | Quando usar |
|---|---|---|
| **APPROVE** | `gh pr review 12 --approve` | Aprovar e liberar pra merge |
| **REQUEST_CHANGES** | `gh pr review 12 --request-changes` | Bloquear merge até corrigirem |
| **COMMENT** | `gh pr review 12 --comment` | Só comentar, sem aprovar nem bloquear |

### Exemplo simples (review sem inline)

```powershell
gh pr review 12 --comment --body "Visual bom, só uns ajustes de label e CSS"
```

## 1.4 Review com comentários inline (linha por linha)

O `gh pr review` é limitado pra inline. Use a **API** do GitHub direto:

```powershell
gh api --method POST repos/OWNER/REPO/pulls/PR_NUMBER/reviews --input arquivo.json
```

### Estrutura do JSON

Crie um arquivo (ex: `review.json`):

```json
{
  "commit_id": "SHA_DO_HEAD_DO_PR",
  "event": "COMMENT",
  "body": "Texto geral da review (aparece no topo)",
  "comments": [
    {
      "path": "caminho/do/arquivo.html",
      "line": 71,
      "side": "RIGHT",
      "body": "Comentário inline na linha 71"
    },
    {
      "path": "outro/arquivo.css",
      "line": 325,
      "side": "RIGHT",
      "body": "Outro comentário"
    }
  ]
}
```

### Campos explicados

| Campo | O que é |
|---|---|
| `commit_id` | SHA do último commit do PR. Pegar com `gh pr view 12 --json headRefOid --jq '.headRefOid'` |
| `event` | `COMMENT`, `APPROVE` ou `REQUEST_CHANGES` |
| `body` | Texto que aparece no topo da review (resumo geral) |
| `comments[].path` | Caminho relativo do arquivo (mesmo formato do diff) |
| `comments[].line` | Número da linha no arquivo **novo** (depois das mudanças) |
| `comments[].side` | Sempre `RIGHT` (lado novo do diff). `LEFT` é o lado antigo, raramente usado |
| `comments[].body` | O comentário em si (suporta Markdown) |

### Comando completo

```powershell
gh api --method POST repos/Oriento-ChatBox-Educacao-Financeira/ChatBoxEducacaoFinanceira/pulls/12/reviews --input review.json
```

### Como descobrir o número da linha certa

```powershell
# Buscar uma string específica em um arquivo da branch do PR
git show origin/refactor/tela-login:frontend/src/app/pages/login/login.html | Select-String "ENDEREÇO"
# Saída: 71: <label ...> ENDEREÇO DE E-MAIL </label>
```

A linha precisa estar **dentro de um hunk do diff** (uma linha que foi adicionada ou contexto próximo). Linhas longe do diff são rejeitadas pela API.

## 1.5 Comentário avulso (sem ser review formal)

Pra só comentar geral, sem inline:

```powershell
gh pr comment 12 --body "Bom trabalho"
```

## 1.6 Ver reviews existentes

```powershell
# Lista todas as reviews do PR
gh pr view 12 --json reviews

# Via API (mais detalhes)
gh api repos/OWNER/REPO/pulls/12/reviews
```

---

# Parte 2: Issues

## 2.1 Listar issues

```powershell
# Todas as abertas
gh issue list

# Filtrar por label
gh issue list --label bug

# Filtrar por assignee
gh issue list --assignee miguelalchaar

# Filtrar por estado
gh issue list --state closed

# Filtrar por autor
gh issue list --author "@me"
```

## 2.2 Criar issue (modo interativo)

```powershell
gh issue create
```

Pergunta título, corpo, labels e assignees um a um. Bom pra issues simples.

## 2.3 Criar issue completa (modo automático)

```powershell
gh issue create `
  --title "feat: implementa validador de CNPJ" `
  --body "Descrição da issue aqui..." `
  --assignee miguelalchaar `
  --label bug `
  --label enhancement
```

### Flags úteis

| Flag | O que faz |
|---|---|
| `--title "..."` | Título |
| `--body "..."` | Corpo (texto curto) |
| `--body-file arquivo.md` | Corpo vindo de um arquivo (recomendado pra texto longo) |
| `--assignee USER` | Atribui pra alguém. Pode repetir pra múltiplos |
| `--label NOME` | Adiciona label. Pode repetir |
| `--milestone "v1.0"` | Vincula a um milestone |
| `--project "Roadmap"` | Adiciona ao project board |

## 2.4 Issue com corpo longo (Markdown)

Crie um arquivo `.md`:

```markdown
## Contexto

Texto explicando o problema...

## O que fazer

1. Item 1
2. Item 2

## Critérios de aceite

- [ ] Checklist
- [ ] De aceite
```

E referencia pelo arquivo:

```powershell
gh issue create --title "feat: ..." --body-file issue.md --assignee USER --label bug
```

Esse é o padrão usado nas issues #14, #15, #16, #17 e #18 do projeto.

## 2.5 Múltiplos assignees

Repete a flag:

```powershell
gh issue create --title "..." --body "..." --assignee josewar --assignee LucelhoSilva
```

## 2.6 Editar issue depois de criada

```powershell
# Editar título
gh issue edit 14 --title "Novo título"

# Editar corpo (de uma string)
gh issue edit 14 --body "Novo corpo"

# Editar corpo (de um arquivo)
gh issue edit 14 --body-file novo-corpo.md

# Adicionar/remover labels
gh issue edit 14 --add-label bug
gh issue edit 14 --remove-label enhancement

# Adicionar/remover assignees
gh issue edit 14 --add-assignee miguelalchaar
gh issue edit 14 --remove-assignee miguelalchaar
```

## 2.7 Ver, comentar, fechar, reabrir

```powershell
# Ver detalhes
gh issue view 14

# Abrir no navegador
gh issue view 14 --web

# Comentar
gh issue comment 14 --body "Adicionei mais contexto"

# Fechar
gh issue close 14
gh issue close 14 --comment "Resolvido em #PR_X"
gh issue close 14 --reason "completed"   # ou "not planned"

# Reabrir
gh issue reopen 14
```

## 2.8 Listar e gerenciar labels

```powershell
# Listar labels disponíveis no repo
gh label list

# Criar label nova
gh label create urgent --color FF0000 --description "Precisa atenção imediata"

# Apagar label
gh label delete urgent
```

---

# Parte 3: Linkando issues e PRs

## 3.1 Fechar issue automaticamente quando o PR mergear

No corpo do PR (ou no commit message), use uma das palavras-chave:

```
Closes #14
Fixes #15
Resolves #18
```

Quando o PR for mergeado em `main`, o GitHub fecha a issue automaticamente.

```powershell
gh pr create `
  --title "feat: validador de CNPJ" `
  --body "Closes #14" `
  --base main
```

## 3.2 Referenciar sem fechar

Apenas mencionar `#14` no corpo cria um link bidirecional sem fechar a issue.

---

# Parte 4: Workflow recomendado

### Recebeu um PR pra revisar

```powershell
gh pr view 12              # leio
gh pr diff 12              # vejo as mudanças
# anoto os pontos que quero comentar
# crio review.json com os inline comments
gh api --method POST repos/.../pulls/12/reviews --input review.json
```

### Achou um bug ou tem uma tarefa

```powershell
# Pra issues simples
gh issue create

# Pra issues bem documentadas (recomendado pro projeto):
# 1. Cria um arquivo .md com a descrição
# 2. gh issue create --body-file arquivo.md --assignee USER --label tipo
```

### Conferindo o que tá aberto

```powershell
gh pr list                       # PRs abertos
gh issue list                    # Issues abertas
gh issue list --assignee "@me"   # Só as suas
```

---

# Atalhos úteis

| Quero... | Comando |
|---|---|
| Abrir o repo no navegador | `gh repo view --web` |
| Abrir um PR no navegador | `gh pr view 12 --web` |
| Abrir uma issue no navegador | `gh issue view 14 --web` |
| Ver meus PRs em todos os repos | `gh search prs --author=@me --state=open` |
| Help de qualquer comando | `gh pr review --help` |

---

# Referências

- Documentação oficial gh CLI: https://cli.github.com/manual/
- API REST do GitHub (reviews): https://docs.github.com/en/rest/pulls/reviews
- API REST do GitHub (issues): https://docs.github.com/en/rest/issues
