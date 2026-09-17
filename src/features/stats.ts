import type { Kana } from '../db/types';

export interface KanaStats {
  totalActive: number;
  seen: number;          // reviewed at least once
  review: number;        // in review phase
  hesitant: number;      // flagged not-yet-automatic
  dueNow: number;
  automatic: number;     // review phase AND not hesitant
  automaticFraction: number;
  hiraSeen: number;
  hiraTotal: number;
  kataSeen: number;
  kataTotal: number;
}

export function kanaStats(all: Kana[], now: number): KanaStats {
  const active = all.filter((k) => k.active);
  const seen = active.filter((k) => k.srs.phase !== 'new');
  const review = active.filter((k) => k.srs.phase === 'review');
  const automatic = review.filter((k) => !k.hesitant);
  const hira = active.filter((k) => k.script === 'hiragana');
  const kata = active.filter((k) => k.script === 'katakana');
  return {
    totalActive: active.length,
    seen: seen.length,
    review: review.length,
    hesitant: active.filter((k) => k.hesitant).length,
    dueNow: seen.filter((k) => k.srs.due <= now).length,
    automatic: automatic.length,
    automaticFraction: active.length ? automatic.length / active.length : 0,
    hiraSeen: hira.filter((k) => k.srs.phase !== 'new').length,
    hiraTotal: hira.length,
    kataSeen: kata.filter((k) => k.srs.phase !== 'new').length,
    kataTotal: kata.length,
  };
}
