# Nihongo Dash

A private, single-user Japanese study PWA — the mechanics I like from Renshuu,
BunPro, KanaDojo, LingoDeer and Anki, unified into one local-first app on my own
curriculum, aimed at **JLPT N3 by the July 2027 sitting**.

Personal use only: no accounts, no other users, no monetization, no telemetry.
Everything lives on-device.

## Status

Rebuild in progress. Shipping in vertical slices.

- **Milestone 1 — Kana Trainer (done):** full data model, FSRS scheduler, kana
  seed data, drill modes (recognition / typing / confusion pairs / automaticity),
  progress dashboard, study log.
- **Next:** `.apkg` + JMdict/KANJIDIC2/Tatoeba import; Vocabulary SRS (Tango N5);
  Grammar notebook; Kanji module (dormant until months 4–5); optional sync.

## Stack

- **React + TypeScript + Vite**, installable **PWA** (`vite-plugin-pwa`).
- **IndexedDB via Dexie** as the source of truth — fully offline; desktop for
  setup/entry, phone (Safari) for quick reviews.
- **FSRS** spaced-repetition scheduler implemented from the published algorithm
  in `src/srs/fsrs.ts` (not ported from Anki/BunPro), shared across every item
  type. Weights are the published FSRS-5 defaults, centralized for later
  re-optimization once real review history exists.

## Content & licensing

Mechanics are inspired by existing tools; **content is not**. Study data comes
from open/licensed sources (JMdict, KANJIDIC2, Tatoeba) or my own material
(Anki decks, handwritten notes). Nothing is scraped or copied from the reference
apps. Milestone one ships only hand-authored kana; importers come next.

## Develop

```sh
npm install
npm run dev          # dev server at /Nihongi-dash/
npm test             # FSRS unit tests (Vitest)
npm run build        # typecheck + production build to dist/
npm run preview      # serve the production build
```

Deploys to GitHub Pages from `main` via `.github/workflows/deploy.yml`
(`npm ci && npm run build` → `dist`). Base path is `/Nihongi-dash/`.

## Layout

```
src/
  db/         Dexie schema + types for every entity (kana/vocab/grammar/kanji/…)
  srs/        FSRS scheduler + tests
  data/       hand-authored kana seed
  study/      queue selection, review→FSRS glue, speed/automaticity, sessions
  features/   Today, KanaTrainer, DrillRunner, Dashboard, StudyLog
  config.ts   exam date, hour target, phases, readiness thresholds
```

The previous single-file version is preserved in `legacy/` and in git history.
