import { db } from './db';
import { KANA_SEED } from '../data/kana';
import { VOCAB_N5_SEED } from '../data/vocabN5';
import { GRAMMAR_N5_SEED } from '../data/grammarN5';
import { newCard } from '../srs/fsrs';
import type { Grammar, Kana, Vocab } from './types';

const KANA_FLAG = 'kanaSeeded.v1';
const VOCAB_FLAG = 'vocabStarterSeeded.v1';
const GRAMMAR_FLAG = 'grammarStarterSeeded.v1';
const GRAMMAR_CONTENT_FLAG = 'grammarContent.v2'; // examples gained romaji

/**
 * Populate seed content on first run. Each pool is guarded by its own meta
 * flag and a presence check, so re-running never duplicates or clobbers review
 * progress — and importing real decks later simply adds alongside the seed.
 */
export async function ensureSeeded(now: number = Date.now()): Promise<void> {
  await seedKana(now);
  await seedVocab(now);
  await seedGrammar(now);
  await migrateGrammarContent(now);
}

/**
 * One-time content refresh for the starter grammar points (they gained romaji
 * on their examples). Updates only `examples` + `structure`, preserving each
 * point's SRS state and my own notes. Fresh installs already seed the current
 * content, so this is a no-op for them beyond setting the flag.
 */
async function migrateGrammarContent(now: number): Promise<void> {
  if (await db.meta.get(GRAMMAR_CONTENT_FLAG)) return;
  await db.transaction('rw', db.grammar, async () => {
    for (const s of GRAMMAR_N5_SEED) {
      const existing = await db.grammar.get(s.id);
      if (existing) {
        await db.grammar.update(s.id, { examples: s.examples, structure: s.structure });
      }
    }
  });
  await db.meta.put({ key: GRAMMAR_CONTENT_FLAG, value: now });
}

async function seedKana(now: number): Promise<void> {
  if (await db.meta.get(KANA_FLAG)) return;
  if ((await db.kana.count()) === 0) {
    const cards: Kana[] = KANA_SEED.map((s) => ({
      ...s,
      active: true,
      hesitant: false,
      rtHistory: [],
      srs: newCard(now),
    }));
    await db.kana.bulkAdd(cards);
  }
  await db.meta.put({ key: KANA_FLAG, value: now });
}

async function seedVocab(now: number): Promise<void> {
  if (await db.meta.get(VOCAB_FLAG)) return;
  if ((await db.vocab.count()) === 0) {
    const cards: Vocab[] = VOCAB_N5_SEED.map((s) => ({
      ...s,
      active: true,
      srs: newCard(now),
    }));
    await db.vocab.bulkAdd(cards);
  }
  await db.meta.put({ key: VOCAB_FLAG, value: now });
}

async function seedGrammar(now: number): Promise<void> {
  if (await db.meta.get(GRAMMAR_FLAG)) return;
  if ((await db.grammar.count()) === 0) {
    const cards: Grammar[] = GRAMMAR_N5_SEED.map((s) => ({
      ...s,
      active: true,
      srs: newCard(now),
    }));
    await db.grammar.bulkAdd(cards);
  }
  await db.meta.put({ key: GRAMMAR_FLAG, value: now });
}
