// ---------------------------------------------------------------------------
// FSRS scheduler (spec §5).
//
// Implemented from the published FSRS-5 algorithm (the open DSR memory model),
// NOT ported from Anki's or BunPro's code. The same scheduler drives every
// item type so review queues can be unified, while each item keeps its own
// due date so per-module review still works.
//
// Reference: the FSRS-5 formulas and default weights are open and documented
// at https://github.com/open-spaced-repetition/fsrs4anki/wiki . Weights are
// centralised here so they can be re-optimised later once real review history
// exists — until then the published defaults are used.
// ---------------------------------------------------------------------------

import type { Rating, SrsState } from '../db/types';

/** Published FSRS-5 default parameters (w0..w18). Tunable later. */
export const DEFAULT_W: readonly number[] = [
  0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046,
  1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315,
  2.9898, 0.51655, 0.6621,
];

// Forgetting curve constants. R(t,S) = (1 + FACTOR·t/S)^DECAY, tuned so that
// R(S,S) = 0.9 (one stability = ~90% recall).
const DECAY = -0.5;
const FACTOR = 19 / 81; // = 0.9^(1/DECAY) − 1

export interface SchedulerOptions {
  /** Desired probability of recall at review time. Default 0.90. */
  requestRetention?: number;
  /** Hard ceiling on interval length in days. */
  maximumInterval?: number;
  /** Parameter vector; defaults to the published FSRS-5 weights. */
  w?: readonly number[];
}

export interface ScheduleResult {
  state: SrsState;
  elapsedDays: number;
  scheduledDays: number;
  retrievability: number; // recall probability at the moment of this review
}

const DAY_MS = 86_400_000;
const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi);

/** Probability of recall after `elapsedDays` given memory stability. */
export function retrievability(elapsedDays: number, stability: number): number {
  if (stability <= 0) return 0;
  return Math.pow(1 + (FACTOR * elapsedDays) / stability, DECAY);
}

/** Days until stability decays to the requested retention. */
export function intervalDays(
  stability: number,
  requestRetention: number,
  maximumInterval: number,
): number {
  const raw = (stability / FACTOR) * (Math.pow(requestRetention, 1 / DECAY) - 1);
  return clamp(Math.round(raw), 1, maximumInterval);
}

// --- Initial state (first-ever rating of a card) ----------------------------

function initStability(w: readonly number[], g: Rating): number {
  return Math.max(w[g - 1], 0.1);
}

function initDifficulty(w: readonly number[], g: Rating): number {
  return clamp(w[4] - Math.exp(w[5] * (g - 1)) + 1, 1, 10);
}

// --- Difficulty update ------------------------------------------------------

function nextDifficulty(w: readonly number[], d: number, g: Rating): number {
  const deltaD = -w[6] * (g - 3);
  const damped = d + deltaD * ((10 - d) / 9); // linear damping toward the edges
  // mean-reversion toward the difficulty of a first "Easy" answer
  const reverted = w[7] * initDifficulty(w, 4) + (1 - w[7]) * damped;
  return clamp(reverted, 1, 10);
}

// --- Stability update -------------------------------------------------------

function stabilityOnSuccess(
  w: readonly number[],
  d: number,
  s: number,
  r: number,
  g: Rating,
): number {
  const hard = g === 2 ? w[15] : 1;
  const easy = g === 4 ? w[16] : 1;
  const inc =
    Math.exp(w[8]) *
    (11 - d) *
    Math.pow(s, -w[9]) *
    (Math.exp((1 - r) * w[10]) - 1) *
    hard *
    easy;
  return s * (1 + inc);
}

function stabilityOnFail(w: readonly number[], d: number, s: number, r: number): number {
  const postLapse =
    w[11] * Math.pow(d, -w[12]) * (Math.pow(s + 1, w[13]) - 1) * Math.exp((1 - r) * w[14]);
  // A lapse can never raise stability above its pre-lapse value.
  return Math.min(postLapse, s);
}

const S_MIN = 0.1;
const S_MAX = 36_500;

/** A fresh card that has never been reviewed. */
export function newCard(now: number = Date.now()): SrsState {
  return {
    stability: 0,
    difficulty: 0,
    due: now,
    lastReview: null,
    reps: 0,
    lapses: 0,
    phase: 'new',
  };
}

/**
 * Apply a rating and return the next SRS state plus the fields a ReviewLog
 * needs. Pure — callers persist the result.
 */
export function schedule(
  prev: SrsState,
  rating: Rating,
  now: number = Date.now(),
  opts: SchedulerOptions = {},
): ScheduleResult {
  const w = opts.w ?? DEFAULT_W;
  const requestRetention = opts.requestRetention ?? 0.9;
  const maximumInterval = opts.maximumInterval ?? S_MAX;

  let stability: number;
  let difficulty: number;
  let elapsedDays: number;
  let r: number;

  if (prev.phase === 'new' || prev.lastReview === null) {
    elapsedDays = 0;
    r = 1;
    stability = initStability(w, rating);
    difficulty = initDifficulty(w, rating);
  } else {
    elapsedDays = Math.max(0, (now - prev.lastReview) / DAY_MS);
    r = retrievability(elapsedDays, prev.stability);
    difficulty = nextDifficulty(w, prev.difficulty, rating);
    stability =
      rating === 1
        ? stabilityOnFail(w, prev.difficulty, prev.stability, r)
        : stabilityOnSuccess(w, prev.difficulty, prev.stability, r, rating);
  }

  stability = clamp(stability, S_MIN, S_MAX);
  const scheduledDays = intervalDays(stability, requestRetention, maximumInterval);

  return {
    state: {
      stability,
      difficulty,
      due: now + scheduledDays * DAY_MS,
      lastReview: now,
      reps: prev.reps + 1,
      lapses: prev.lapses + (rating === 1 ? 1 : 0),
      phase: rating === 1 ? 'relearning' : 'review',
    },
    elapsedDays,
    scheduledDays,
    retrievability: r,
  };
}
