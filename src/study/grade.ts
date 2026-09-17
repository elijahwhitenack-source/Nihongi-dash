// Unified grading: apply FSRS to any item type and write the review log.
// Used by the Anki-style reveal-and-grade review (Today, Vocab). The fast kana
// recognition drills use applyKanaReview instead (it also tracks speed).

import { db } from '../db/db';
import { schedule } from '../srs/fsrs';
import type { ItemType, Rating, SrsState } from '../db/types';

export interface Gradable {
  id: string;
  srs: SrsState;
}

export async function gradeItem<T extends Gradable>(
  itemType: ItemType,
  card: T,
  rating: Rating,
  now: number = Date.now(),
): Promise<T> {
  const res = schedule(card.srs, rating, now);

  await db.transaction('rw', [db.kana, db.vocab, db.grammar, db.kanji, db.reviews], async () => {
    switch (itemType) {
      case 'kana':
        await db.kana.update(card.id, { srs: res.state });
        break;
      case 'vocab':
        await db.vocab.update(card.id, { srs: res.state });
        break;
      case 'grammar':
        await db.grammar.update(card.id, { srs: res.state });
        break;
      case 'kanji':
        await db.kanji.update(card.id, { srs: res.state });
        break;
    }
    await db.reviews.add({
      itemType,
      itemId: card.id,
      rating,
      reviewedAt: now,
      elapsedDays: res.elapsedDays,
      scheduledDays: res.scheduledDays,
      responseMs: 0,
      stabilityAfter: res.state.stability,
      difficultyAfter: res.state.difficulty,
    });
  });

  return { ...card, srs: res.state };
}
