# Memória compartilhada do Claude Code

Esta pasta versiona a **memória do Claude Code** para o projeto copa2026, permitindo
compartilhá-la entre múltiplos PCs **via git** (push/pull no mesmo repositório).

> ⚠️ Este repositório é **público** — qualquer conteúdo escrito aqui fica visível no GitHub.
> Não anote nada sensível/pessoal.

## Como funciona

Em cada PC, a pasta de memória que o Claude usa por padrão
(`~/.claude/projects/<hash-do-caminho>/memory`) é substituída por um **junction**
(link de diretório) apontando para esta pasta `.memory/` dentro do repo.

Assim, a memória escrita pelo Claude cai dentro do repo, é commitada, e o
`git push`/`pull` a leva para o(s) outro(s) PC(s).

## Setup em um PC novo (Windows / PowerShell)

```powershell
# 1) Caminho da pasta de memória do Claude para ESTE projeto (ajuste o usuário/caminho):
$link   = "$env:USERPROFILE\.claude\projects\c--Users-<USUARIO>-Documents-copa-2026\memory"

# 2) Caminho desta pasta .memory dentro do clone local do repo:
$target = "C:\Users\<USUARIO>\Documents\copa-2026\.memory"

# 3) Remover a pasta de memória local (se existir e estiver vazia) e criar o junction:
if (Test-Path $link) { Remove-Item $link -Recurse -Force }
New-Item -ItemType Junction -Path $link -Target $target
```

> O nome `c--Users-...` é derivado do caminho absoluto do clone, com `:` e `\`/`/`
> trocados por `-`. Confira o nome real da pasta dentro de `~/.claude/projects/`.

## Fluxo de uso (dois PCs, edição não simultânea)

- **Antes de trabalhar**: `git pull` (puxa código + memória atualizada)
- **Ao terminar**: `git commit` + `git push`
- A junction faz a memória nova aparecer automaticamente para o Claude do outro lado.
