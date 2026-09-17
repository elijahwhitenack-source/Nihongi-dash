// Personal study targets (spec §1, §6.6). Precise numbers, not vibes.

/** JLPT sitting being targeted: July 2027 (first-Sunday sitting). */
export const EXAM_DATE = '2027-07-04';
export const EXAM_LABEL = 'JLPT N3 · July 2027';

/** ~7 hrs/week × ~10 months ≈ 300 hours. */
export const TARGET_HOURS = 300;

/** Study phases in planned order (spec §1). */
export interface Phase {
  id: string;
  label: string;
  detail: string;
}
export const PHASES: Phase[] = [
  { id: 'kana', label: 'Kana automaticity', detail: 'dakuten · handakuten · combos, then katakana' },
  { id: 'parallel', label: 'Vocab + grammar', detail: 'Tango N5 + は/が, predicate types (month 2)' },
  { id: 'kanji', label: 'Kanji', detail: 'radical → kanji → vocab (months 4–5)' },
  { id: 'consolidate', label: 'N4 → N3 push', detail: 'grammar depth, review load, mock tests' },
];

/** Concrete readiness thresholds shown on the dashboard (spec §6.6). */
export const READINESS = {
  kanaAutomatic: 0.9,   // fraction of kana at review-phase, non-hesitant
  n5VocabForN4: 800,    // ballpark words retained
  n4GrammarForN3: 120,  // ballpark grammar points retained
};
