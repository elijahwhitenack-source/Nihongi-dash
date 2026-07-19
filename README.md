# Nihongo Dash

A single-file Japanese study PWA — built to go from zero to functional travel Japanese in about a month, at ~30 minutes a day.

Installable, works offline, stores everything locally. No accounts, no backend, no tracking.

## Run it

It's static — any web server works, but it needs a real origin (service workers refuse to
register on `file://`, so opening `index.html` directly gives you no offline support and no
install prompt):

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## How it works

**Tiered progression.** Seven tiers, gated so you start with 46 hiragana and nothing else:

| Tier | Content |
|---|---|
| 1 | Hiragana |
| 2 | Katakana |
| 3 | Numbers & colors |
| 4 | Pronouns & time — first real sentences |
| 5 | Adjectives & things — one word in one slot |
| 6 | Verbs & actions — particles, ます / ました |
| 7 | Survival phrases — full sentences |

A tier unlocks automatically once 80% of the previous one is solid. **Path → Unlock early**
overrides that if you're moving faster.

**Spaced repetition.** A leveled-box scheduler. Boxes 0–3 are an in-session learning ladder
(1 min → 5 min → 25 min) so new cards recur several times before graduating; boxes 4–7 are real
retention (6h → 1d → 3d → 7d). Nothing exceeds a week — the whole plan is one month long.

**Adaptive pacing.** A daily new-card quota (default 12) shifts by ±3 based on recent accuracy,
adjusted once per day. Once the quota is met, the session keeps serving your weakest cards
rather than dead-ending before you hit 30 minutes.

**Four study modes.** Multiple choice, typing (accepts romaji *or* English), recall, and
**Listen** — which hides the writing entirely and plays audio as the prompt, then reveals the
Japanese so ear and eye connect.

## Audio

Uses the browser's speech synthesis with a Japanese voice, preferring a *local* one so it still
works offline. If none is installed the audio button and Listen mode disable themselves and
explain how to add one.

- **macOS**: System Settings → Accessibility → Spoken Content → System Voice → Manage Voices → Japanese
- **iOS**: Settings → Accessibility → Spoken Content → Voices

Press <kbd>J</kbd> to replay the current card's audio.

## Editing the content

All study content lives in three arrays at the top of the `<script>` in `index.html`:

- **`DECK`** — the main deck: kana, vocabulary, and grammar. Grammar entries use
  `title` / `jp` / `en`; everything else uses `front` / `back`. Grammar is reference material and
  never becomes a flashcard.
- **`NOUN_PACK`** — concrete nouns (food, places, objects) that the grammar patterns need
  something to attach to. Separate so it can be deleted independently.
- **`PHRASE_TEMPLATES`** — combination drills. Each names the grammar rule it exercises via
  `rule`, so the Grammar tab can show which phrases drill which pattern.

Tiers are derived at load time by `tierOf()` — an explicit `tier` field wins, otherwise it's
inferred from the id prefix. Deck entries are never mutated.

## Files

| File | Purpose |
|---|---|
| `index.html` | The entire app — markup, styles, logic, content |
| `sw.js` | Service worker. Network-first for the shell, cache-first for assets |
| `manifest.json` | PWA manifest |
| `icon.svg` | App icon |
