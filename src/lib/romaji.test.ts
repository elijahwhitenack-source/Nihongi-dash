import { describe, it, expect } from 'vitest';
import { kanaToRomaji } from './romaji';

describe('kanaToRomaji', () => {
  it('transliterates plain hiragana', () => {
    expect(kanaToRomaji('さかな')).toBe('sakana');
    expect(kanaToRomaji('にほんご')).toBe('nihongo');
    expect(kanaToRomaji('みず')).toBe('mizu');
  });

  it('handles digraphs (yōon)', () => {
    expect(kanaToRomaji('きょう')).toBe('kyou');
    expect(kanaToRomaji('しゃ')).toBe('sha');
    expect(kanaToRomaji('とうきょう')).toBe('toukyou');
  });

  it('handles the small tsu (sokuon)', () => {
    expect(kanaToRomaji('がっこう')).toBe('gakkou');
    expect(kanaToRomaji('きって')).toBe('kitte');
  });

  it('handles katakana and the long-vowel mark', () => {
    expect(kanaToRomaji('ホテル')).toBe('hoteru');
    expect(kanaToRomaji('コーヒー')).toBe('koohii');
  });

  it('passes kanji and punctuation through, romanizing the kana around them', () => {
    // 猫がいます。 — 猫 is kanji and stays; the kana becomes romaji
    expect(kanaToRomaji('猫がいます。')).toBe('猫gaimasu。');
    expect(kanaToRomaji('です')).toBe('desu');
  });
});
