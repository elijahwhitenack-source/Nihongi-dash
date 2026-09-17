// Pure queue selection for the Kana Trainer (spec §6.1). Operates on the
// in-memory kana array (the pool is small) so it stays testable and cheap.

import type { Kana } from '../db/types';
import { shuffle } from '../lib/util';

export type DrillMode = 'due' | 'recognition' | 'confusion' | 'automaticity';

export type ScriptFilter = 'both' | 'hiragana' | 'katakana';

const isNew = (k: Kana) => k.srs.phase === 'new';
const isDue = (k: Kana, now: number) => !isNew(k) && k.srs.due <= now;

export function dueKana(all: Kana[], now: number): Kana[] {
  return all
    .filter((k) => k.active && isDue(k, now))
    .sort((a, b) => a.srs.due - b.srs.due);
}

export function newKana(all: Kana[]): Kana[] {
  return all.filter((k) => k.active && isNew(k));
}

export function hesitantKana(all: Kana[]): Kana[] {
  return all.filter((k) => k.active && k.hesitant);
}

function byScript(all: Kana[], f: ScriptFilter): Kana[] {
  return f === 'both' ? all : all.filter((k) => k.script === f);
}

export interface QueueOpts {
  mode: DrillMode;
  script?: ScriptFilter;
  now: number;
  /** cap on new cards introduced in a free drill session */
  newLimit?: number;
  /** total length cap for a drill session */
  limit?: number;
}

/**
 * Build an ordered study queue for a mode. `due` respects FSRS ordering; the
 * game-like modes shuffle and can loop for fast repetition drilling.
 */
export function buildQueue(all: Kana[], opts: QueueOpts): Kana[] {
  const { mode, now } = opts;
  const script = opts.script ?? 'both';
  const pool = byScript(
    all.filter((k) => k.active),
    script,
  );

  if (mode === 'due') {
    const due = dueKana(pool, now);
    const fresh = shuffle(newKana(pool)).slice(0, opts.newLimit ?? 10);
    // interleave a few new cards after the due backlog
    return [...due, ...fresh];
  }

  if (mode === 'confusion') {
    const cf = pool.filter((k) => k.confusionGroup);
    return shuffle(cf).slice(0, opts.limit ?? cf.length);
  }

  if (mode === 'automaticity') {
    return shuffle(hesitantKana(pool)).slice(0, opts.limit ?? 40);
  }

  // recognition: free practice — due first, then new, then everything
  const due = dueKana(pool, now);
  const rest = shuffle(pool.filter((k) => !due.includes(k)));
  return [...due, ...rest].slice(0, opts.limit ?? 40);
}

/** Distractor romaji for a multiple-choice question. Confusion-group members
 *  are preferred so the wrong options are genuinely tempting. */
export function distractors(card: Kana, all: Kana[], n: number): string[] {
  const others = all.filter((k) => k.romaji !== card.romaji);
  const sameGroup = card.confusionGroup
    ? others.filter((k) => k.confusionGroup === card.confusionGroup)
    : [];
  const sameScript = others.filter((k) => k.script === card.script);
  const picks: string[] = [];
  const seen = new Set<string>([card.romaji]);
  for (const bucket of [sameGroup, sameScript, others]) {
    for (const k of shuffle(bucket)) {
      if (picks.length >= n) break;
      if (!seen.has(k.romaji)) {
        seen.add(k.romaji);
        picks.push(k.romaji);
      }
    }
    if (picks.length >= n) break;
  }
  return picks;
}
