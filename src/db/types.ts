// ---------------------------------------------------------------------------
// Core data model (spec §4). The full schema is defined now; only kana is
// populated for milestone one. Vocab / grammar / kanji tables exist but stay
// empty and hidden in the UI until their phase.
// ---------------------------------------------------------------------------

export type Rating = 1 | 2 | 3 | 4; // Again / Hard / Good / Easy
export const RATING = { AGAIN: 1, HARD: 2, GOOD: 3, EASY: 4 } as const;

export type ItemType = 'kana' | 'vocab' | 'grammar' | 'kanji';

export type SrsPhase = 'new' | 'learning' | 'review' | 'relearning';

/** Shared SRS state across every item type (spec §4, §5). FSRS shape. */
export interface SrsState {
  stability: number;      // FSRS S — days for retrievability to fall to ~90%
  difficulty: number;     // FSRS D — 1..10
  due: number;            // epoch ms of next scheduled review
  lastReview: number | null; // epoch ms of previous review
  reps: number;           // total reviews
  lapses: number;         // times rated Again while in review
  phase: SrsPhase;
}

/** One review event, kept as history for stats and future FSRS optimization. */
export interface ReviewLog {
  id?: number;
  itemType: ItemType;
  itemId: string;
  rating: Rating;
  reviewedAt: number;         // epoch ms
  elapsedDays: number;        // since previous review
  scheduledDays: number;      // interval assigned by this review
  responseMs: number;         // how long the answer took (automaticity signal)
  stabilityAfter: number;
  difficultyAfter: number;
}

// --- Kana (spec §4 + §6.1) ---------------------------------------------------

export type KanaScript = 'hiragana' | 'katakana';
export type KanaType = 'base' | 'dakuten' | 'handakuten' | 'combo';

export interface Kana {
  id: string;               // e.g. "h-ka", "k-kyo"
  char: string;             // き ょ combined etc.
  romaji: string;           // canonical answer, e.g. "kya"
  altRomaji?: string[];     // accepted alternates, e.g. ["si"] for し
  script: KanaScript;
  type: KanaType;
  confusionGroup?: string;  // tag; cards sharing it are visually confusable
  active: boolean;          // in the study pool
  hesitant: boolean;        // flagged slow / not yet automatic
  rtHistory: number[];      // recent correct-answer response times (ms)
  srs: SrsState;
}

// --- Vocabulary (spec §4, dormant data) -------------------------------------

export interface Vocab {
  id: string;
  word: string;
  reading: string;
  meanings: string[];
  jlpt?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  partOfSpeech?: string[];
  sourceDeck?: string;      // e.g. "Tango N5"
  exampleRefs?: number[];   // Tatoeba sentence ids
  // Inline example carried by imported decks. `reading` is pure kana so the
  // app derives romaji from it; `jp` is the surface (may contain kanji).
  example?: { jp: string; reading?: string; en?: string };
  active: boolean;
  srs: SrsState;
}

// --- Grammar point (spec §4 + §6.3) -----------------------------------------

export interface Grammar {
  id: string;
  title: string;            // pattern, e.g. "は vs が"
  jlpt?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  structure: string;        // my own wording — never lifted from BunPro/Tae Kim
  examples: { jp: string; ro?: string; en: string }[]; // ro = romaji pronunciation
  relatedIds: string[];     // confusable / related grammar points
  notes: string;            // my own notes field
  active: boolean;
  srs: SrsState;
}

// --- Kanji (spec §4, dormant until months 4–5) ------------------------------

export interface Kanji {
  id: string;
  char: string;
  meanings: string[];
  onyomi: string[];
  kunyomi: string[];
  jlpt?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  grade?: number;
  radicals?: string[];
  strokeCount?: number;
  vocabIds: string[];       // linked vocabulary using this kanji
  active: boolean;
  srs: SrsState;
}

// --- Study session log (spec §4 + §6.7) -------------------------------------

export interface StudySession {
  id?: number;
  date: string;             // YYYY-MM-DD (local)
  startedAt: number;
  endedAt?: number;
  durationMin: number;
  modules: string[];        // which modules were touched
  itemsReviewed: number;
  notes: string;
}

// --- App meta / settings -----------------------------------------------------

export interface Meta {
  key: string;
  value: unknown;
}
