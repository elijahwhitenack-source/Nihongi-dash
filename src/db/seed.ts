import { db } from './db';
import { KANA_SEED } from '../data/kana';
import { VOCAB_N5_SEED } from '../data/vocabN5';
import { newCard } from '../srs/fsrs';
import type { Kana, Vocab } from './types';

const KANA_FLAG = 'kanaSeeded.v1';
const VOCAB_FLAG = 'vocabStarterSeeded.v1';

/**
 * Populate seed content on first run. Each pool is guarded by its own meta
 * flag and a presence check, so re-running never duplicates or clobbers review
 * progress — and importing real decks later simply adds alongside the seed.
 */
export async function ensureSeeded(now: number = Date.now()): Promise<void> {
  await seedKana(now);
  await seedVocab(now);
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
