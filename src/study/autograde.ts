import type { Rating } from '../db/types';

/**
 * Fast game-like drills (KanaDojo-style) auto-grade from correctness + speed
 * so you're not tapping four buttons every card. Speed matters: a correct but
 * slow answer is "Hard", because automaticity means answering fast.
 *
 * The unified Due Review keeps the explicit 4-button Anki scale instead
 * (see spec §5) — this is only for the fast drills.
 */
export function autoGrade(correct: boolean, responseMs: number, baseline: number): Rating {
  if (!correct) return 1; // Again
  const ratio = responseMs / baseline;
  if (ratio <= 0.8) return 4; // Easy — faster than your solid baseline
  if (ratio <= 1.6) return 3; // Good
  return 2; // Hard — correct but you had to decode it
}
