// Connects a kana answer to FSRS scheduling, speed-based automaticity
// tracking, and persistence (spec §5, §6.1).

import { db } from '../db/db';
import { schedule } from '../srs/fsrs';
import type { Kana, Rating } from '../db/types';
import { median } from '../lib/util';

const RT_KEEP = 8;                 // recent correct response times per card
const DEFAULT_BASELINE_MS = 2500;  // until enough "solid" data exists
const HESITANT_FACTOR = 1.5;       // slower than this × baseline ⇒ not automatic

export function cardMedianRt(k: Kana): number | null {
  return k.rtHistory.length ? median(k.rtHistory) : null;
}

/**
 * Baseline reading speed = median response time across cards that are already
 * solid (in review phase, decent stability, enough samples). Automaticity is
 * defined relative to this, per spec: reading a card at roughly the speed of
 * the cards you know cold.
 */
export function baselineRt(all: Kana[]): number {
  const solid = all.filter(
    (k) => k.srs.phase === 'review' && k.srs.stability >= 4 && k.rtHistory.length >= 3,
  );
  const meds = solid.map((k) => median(k.rtHistory));
  if (meds.length < 5) return DEFAULT_BASELINE_MS;
  return median(meds);
}

export function computeHesitant(k: Kana, baseline: number): boolean {
  if (k.rtHistory.length < 3) return k.hesitant; // not enough data — leave as is
  return median(k.rtHistory) > baseline * HESITANT_FACTOR;
}

export interface ReviewInput {
  card: Kana;
  rating: Rating;
  responseMs: number;
  all: Kana[];      // current pool, for baseline computation
  now?: number;
}

/** Apply a rating: schedule via FSRS, update speed history + hesitant flag,
 *  write the review log, and persist. Returns the updated card. */
export async function applyKanaReview({
  card,
  rating,
  responseMs,
  all,
  now = Date.now(),
}: ReviewInput): Promise<Kana> {
  const res = schedule(card.srs, rating, now);

  // Only correct answers contribute to the speed profile.
  const rtHistory =
    rating === 1 ? card.rtHistory : [...card.rtHistory, responseMs].slice(-RT_KEEP);

  const baseline = baselineRt(all);
  const probe: Kana = { ...card, rtHistory };
  const hesitant = rating === 1 ? true : computeHesitant(probe, baseline);

  const updated: Kana = { ...card, srs: res.state, rtHistory, hesitant };

  await db.transaction('rw', db.kana, db.reviews, async () => {
    await db.kana.put(updated);
    await db.reviews.add({
      itemType: 'kana',
      itemId: card.id,
      rating,
      reviewedAt: now,
      elapsedDays: res.elapsedDays,
      scheduledDays: res.scheduledDays,
      responseMs,
      stabilityAfter: res.state.stability,
      difficultyAfter: res.state.difficulty,
    });
  });

  return updated;
}

/** Manually toggle a card's hesitant flag (user says "still shaky"). */
export async function flagHesitant(card: Kana, hesitant: boolean): Promise<void> {
  await db.kana.update(card.id, { hesitant });
}
