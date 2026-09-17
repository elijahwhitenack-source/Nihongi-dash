// Kana → Hepburn romaji, so pronunciation shows across the app (spec: teineigo
// pronunciation help for a learner still on katakana/kanji). Built from the
// same KANA_SEED table the drills use, so romaji stays consistent everywhere.
// Kanji and other non-kana characters pass through unchanged.

import { KANA_SEED } from '../data/kana';

const MAP = new Map<string, string>();
for (const k of KANA_SEED) MAP.set(k.char, k.romaji);

const SMALL_TSU = new Set(['っ', 'ッ']);
const LONG_MARK = 'ー';
const isVowel = (c: string) => 'aeiou'.includes(c);

/** Transliterate a (possibly mixed) Japanese string; leaves kanji/latin as-is. */
export function kanaToRomaji(input: string): string {
  let out = '';
  let i = 0;
  while (i < input.length) {
    const ch = input[i];

    // Sokuon: doubles the next mora's initial consonant (ち → "tch").
    if (SMALL_TSU.has(ch)) {
      const nextTwo = input.slice(i + 1, i + 3);
      const nextOne = input[i + 1] ?? '';
      const nr = MAP.get(nextTwo) ?? MAP.get(nextOne);
      if (nr) out += nr[0] === 'c' ? 't' : nr[0];
      i += 1;
      continue;
    }

    // Long-vowel mark: repeat the previous vowel.
    if (ch === LONG_MARK) {
      const last = out[out.length - 1];
      if (last && isVowel(last)) out += last;
      i += 1;
      continue;
    }

    // Greedy: match a 2-char digraph (きゃ) before a single kana.
    const two = input.slice(i, i + 2);
    if (MAP.has(two)) {
      out += MAP.get(two)!;
      i += 2;
      continue;
    }
    if (MAP.has(ch)) {
      out += MAP.get(ch)!;
      i += 1;
      continue;
    }

    // Non-kana (kanji, punctuation, spaces, latin) — pass through.
    out += ch;
    i += 1;
  }
  return out;
}
