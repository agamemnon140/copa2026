# Notas para agentes (Claude Code)

## ⚠️ SEMPRE sincronizar antes de começar
Este repositório é desenvolvido em **2 máquinas**. O checkout local **frequentemente está
atrás** do remoto. Antes de qualquer trabalho, **por padrão faça o pull**:

```bash
git pull --ff-only                    # default: traz e aplica (só fast-forward, seguro)
```

Se quiser **inspecionar antes de aplicar** (recomendado para um agente, ou quando há mudanças
locais não commitadas), use o fetch e compare primeiro:

```bash
git fetch origin
git log --oneline HEAD..origin/main   # o que tem de novo no remoto
git diff HEAD origin/main             # o que mudaria
git pull --ff-only                    # então aplica
```

`git fetch` só baixa/atualiza as refs (não toca nos seus arquivos); `git pull` = `fetch` + `merge`
(aplica no working tree). Trabalhar sem sincronizar já causou explorar/editar código morto.

## Fonte de verdade × build
- **`simulador_copa_2026.jsx`** é a FONTE (React, componente `WC2026`). É o que se edita.
- **`index.html`** é o **bundle gerado** por `_build/build.cjs` (esbuild → IIFE numa linha
  só; por isso o diff dele parece minúsculo). NÃO editar à mão.
- Após editar o `.jsx`, **rebuildar**:
  ```bash
  cd _build && node build.cjs
  ```
- `_build/test.cjs` = testes numéricos do motor; `_build/smoke.cjs` / `drive.cjs` =
  verificação via Playwright (Chrome do sistema). Rodar `npm i` dentro de `_build/` num
  clone novo (node_modules é gitignored).
- `sw.js` é network-first → deploys chegam sem bump de cache.
- `simulador_copa_2026.html` é um build Babel antigo — **ignorar**.

## Dados que se atualizam conforme a Copa avança
- `BUILT_IN_RESULTS` (topo do `.jsx`): resultados oficiais já jogados. Chave numérica
  `1..72` = fase de grupos; `'k73'..'k104'` = mata-mata; `pw:'A'|'B'` = vencedor nos pênaltis.
- Ratings (`ELO`, `BET`, `PELE`, `FP`) são snapshots fixos; o **Elo dinâmico**
  (`computeDynAdj`) recalcula a força a partir dos resultados reais.
