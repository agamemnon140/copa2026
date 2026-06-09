---
name: setup-memoria-e-git-multi-pc
description: Como a memória é compartilhada entre os 2 PCs e o fluxo de git para editar sem conflito
metadata:
  type: project
---

O projeto copa2026 é editado a partir de **dois PCs diferentes** (clones separados do mesmo
repo público `agamemnon140/copa2026`), **nunca ao mesmo tempo**.

**Memória compartilhada:** a pasta de memória do Claude (`~/.claude/projects/<hash>/memory`)
de cada PC é um **junction** apontando para `.memory/` dentro do repo. A `.memory/` é
versionada no git, então a memória viaja via push/pull. Setup documentado em `.memory/README.md`.
⚠️ Repo é público — não anotar nada sensível aqui.

**Fluxo de git (evitar conflito):** `git pull` antes de editar → `git commit` + `git push` ao
terminar → `git pull` no outro PC antes de mexer.

**How to apply:** Ao mexer no [[build-jsx-gera-index-html]] (`simulador_copa_2026.jsx`),
regenerar e commitar o `index.html` junto, pois é o build esbuild da fonte.
