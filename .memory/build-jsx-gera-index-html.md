---
name: build-jsx-gera-index-html
description: index.html é o build esbuild de simulador_copa_2026.jsx — devem ser commitados juntos
metadata:
  type: project
---

No repo copa2026, o `simulador_copa_2026.jsx` é a **fonte** React; o `index.html` (servido pelo
PWA) é o **bundle de produção gerado por esbuild** a partir dela.

**Why:** Editar só o `.jsx` sem regenerar deixa o app rodando código antigo; commitar dessincronizado
quebra a outra sessão/PC.

**How to apply:** Após alterar o `.jsx`, regenerar o `index.html` (esbuild) e commitar os dois juntos.
Ver fluxo multi-PC em [[setup-memoria-e-git-multi-pc]].
