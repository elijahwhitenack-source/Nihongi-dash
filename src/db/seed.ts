import { db } from './db';
import { KANA_SEED } from '../data/kana';
import { newCard } from '../srs/fsrs';
import type { Kana } from './types';

const SEED_FLAG = 'kanaSeeded.v1';

/**
 * Populate the kana pool on first run. Idempotent: guarded by a meta flag and
 * a count check so re-running never duplicates or clobbers review progress.
 */
export async function ensureSeeded(now: number = Date.now()): Promise<void> {
  const flag = await db.meta.get(SEED_FLAG);
  if (flag) return;

  const existing = await db.kana.count();
  if (existing === 0) {
    const cards: Kana[] = KANA_SEED.map((s) => ({
      ...s,
      active: true,
      hesitant: false,
      rtHistory: [],
      srs: newCard(now),
    }));
    await db.kana.bulkAdd(cards);
  }

  await db.meta.put({ key: SEED_FLAG, value: now });
}
