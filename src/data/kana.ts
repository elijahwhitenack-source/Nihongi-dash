// ---------------------------------------------------------------------------
// Kana seed data (spec §6.1). Hand-authored, not scraped. Each row yields a
// hiragana card and its katakana counterpart. Confusion groups tag the
// visually confusable sets so the pair-drill mode can target them.
//
// Romaji uses Hepburn as canonical, with common alternates accepted on input
// (e.g. し = "shi", also accepts "si").
// ---------------------------------------------------------------------------

import type { Kana, KanaScript, KanaType } from '../db/types';

/** A row describes one sound; it becomes a hiragana + a katakana card. */
interface Row {
  key: string;        // stable id fragment, unique across all rows
  hira: string;
  kata: string;
  romaji: string;
  alt?: string[];     // accepted alternates
  type: KanaType;
  /** confusion tag; may differ per script (hiragana and katakana confuse
   *  with different neighbours), so given as [hiraGroup?, kataGroup?]. */
  cf?: [string?, string?];
}

// --- Base gojūon -------------------------------------------------------------
const BASE: Row[] = [
  { key: 'a', hira: 'あ', kata: 'ア', romaji: 'a', type: 'base', cf: ['ao', 'amax'] },
  { key: 'i', hira: 'い', kata: 'イ', romaji: 'i', type: 'base', cf: ['iri'] },
  { key: 'u', hira: 'う', kata: 'ウ', romaji: 'u', type: 'base', cf: [undefined, 'uwa'] },
  { key: 'e', hira: 'え', kata: 'エ', romaji: 'e', type: 'base' },
  { key: 'o', hira: 'お', kata: 'オ', romaji: 'o', type: 'base', cf: ['ao'] },
  { key: 'ka', hira: 'か', kata: 'カ', romaji: 'ka', type: 'base', cf: [undefined, 'kutake'] },
  { key: 'ki', hira: 'き', kata: 'キ', romaji: 'ki', type: 'base', cf: ['kisa'] },
  { key: 'ku', hira: 'く', kata: 'ク', romaji: 'ku', type: 'base', cf: [undefined, 'kutake'] },
  { key: 'ke', hira: 'け', kata: 'ケ', romaji: 'ke', type: 'base', cf: [undefined, 'kutake'] },
  { key: 'ko', hira: 'こ', kata: 'コ', romaji: 'ko', type: 'base' },
  { key: 'sa', hira: 'さ', kata: 'サ', romaji: 'sa', type: 'base', cf: ['kisa'] },
  { key: 'shi', hira: 'し', kata: 'シ', romaji: 'shi', alt: ['si'], type: 'base', cf: [undefined, 'shitsu'] },
  { key: 'su', hira: 'す', kata: 'ス', romaji: 'su', type: 'base' },
  { key: 'se', hira: 'せ', kata: 'セ', romaji: 'se', type: 'base' },
  { key: 'so', hira: 'そ', kata: 'ソ', romaji: 'so', type: 'base', cf: [undefined, 'sonno'] },
  { key: 'ta', hira: 'た', kata: 'タ', romaji: 'ta', type: 'base', cf: [undefined, 'kutake'] },
  { key: 'chi', hira: 'ち', kata: 'チ', romaji: 'chi', alt: ['ti'], type: 'base', cf: [undefined, 'chite'] },
  { key: 'tsu', hira: 'つ', kata: 'ツ', romaji: 'tsu', alt: ['tu'], type: 'base', cf: [undefined, 'shitsu'] },
  { key: 'te', hira: 'て', kata: 'テ', romaji: 'te', type: 'base', cf: [undefined, 'chite'] },
  { key: 'to', hira: 'と', kata: 'ト', romaji: 'to', type: 'base' },
  { key: 'na', hira: 'な', kata: 'ナ', romaji: 'na', type: 'base' },
  { key: 'ni', hira: 'に', kata: 'ニ', romaji: 'ni', type: 'base' },
  { key: 'nu', hira: 'ぬ', kata: 'ヌ', romaji: 'nu', type: 'base', cf: ['nurewame'] },
  { key: 'ne', hira: 'ね', kata: 'ネ', romaji: 'ne', type: 'base', cf: ['nurewame'] },
  { key: 'no', hira: 'の', kata: 'ノ', romaji: 'no', type: 'base', cf: [undefined, 'sonno'] },
  { key: 'ha', hira: 'は', kata: 'ハ', romaji: 'ha', type: 'base', cf: ['haho'] },
  { key: 'hi', hira: 'ひ', kata: 'ヒ', romaji: 'hi', type: 'base' },
  { key: 'fu', hira: 'ふ', kata: 'フ', romaji: 'fu', alt: ['hu'], type: 'base' },
  { key: 'he', hira: 'へ', kata: 'ヘ', romaji: 'he', type: 'base' },
  { key: 'ho', hira: 'ほ', kata: 'ホ', romaji: 'ho', type: 'base', cf: ['haho'] },
  { key: 'ma', hira: 'ま', kata: 'マ', romaji: 'ma', type: 'base' },
  { key: 'mi', hira: 'み', kata: 'ミ', romaji: 'mi', type: 'base' },
  { key: 'mu', hira: 'む', kata: 'ム', romaji: 'mu', type: 'base' },
  { key: 'me', hira: 'め', kata: 'メ', romaji: 'me', type: 'base', cf: ['nurewame'] },
  { key: 'mo', hira: 'も', kata: 'モ', romaji: 'mo', type: 'base' },
  { key: 'ya', hira: 'や', kata: 'ヤ', romaji: 'ya', type: 'base' },
  { key: 'yu', hira: 'ゆ', kata: 'ユ', romaji: 'yu', type: 'base' },
  { key: 'yo', hira: 'よ', kata: 'ヨ', romaji: 'yo', type: 'base' },
  { key: 'ra', hira: 'ら', kata: 'ラ', romaji: 'ra', type: 'base' },
  { key: 'ri', hira: 'り', kata: 'リ', romaji: 'ri', type: 'base', cf: ['iri'] },
  { key: 'ru', hira: 'る', kata: 'ル', romaji: 'ru', type: 'base', cf: ['ruro'] },
  { key: 're', hira: 'れ', kata: 'レ', romaji: 're', type: 'base', cf: ['nurewame'] },
  { key: 'ro', hira: 'ろ', kata: 'ロ', romaji: 'ro', type: 'base', cf: ['ruro'] },
  { key: 'wa', hira: 'わ', kata: 'ワ', romaji: 'wa', type: 'base', cf: ['nurewame', 'uwa'] },
  { key: 'wo', hira: 'を', kata: 'ヲ', romaji: 'wo', alt: ['o'], type: 'base' },
  { key: 'n', hira: 'ん', kata: 'ン', romaji: 'n', type: 'base', cf: [undefined, 'sonno'] },
];

// --- Dakuten -----------------------------------------------------------------
const DAKUTEN: Row[] = [
  { key: 'ga', hira: 'が', kata: 'ガ', romaji: 'ga', type: 'dakuten' },
  { key: 'gi', hira: 'ぎ', kata: 'ギ', romaji: 'gi', type: 'dakuten' },
  { key: 'gu', hira: 'ぐ', kata: 'グ', romaji: 'gu', type: 'dakuten' },
  { key: 'ge', hira: 'げ', kata: 'ゲ', romaji: 'ge', type: 'dakuten' },
  { key: 'go', hira: 'ご', kata: 'ゴ', romaji: 'go', type: 'dakuten' },
  { key: 'za', hira: 'ざ', kata: 'ザ', romaji: 'za', type: 'dakuten' },
  { key: 'ji', hira: 'じ', kata: 'ジ', romaji: 'ji', alt: ['zi'], type: 'dakuten' },
  { key: 'zu', hira: 'ず', kata: 'ズ', romaji: 'zu', type: 'dakuten' },
  { key: 'ze', hira: 'ぜ', kata: 'ゼ', romaji: 'ze', type: 'dakuten' },
  { key: 'zo', hira: 'ぞ', kata: 'ゾ', romaji: 'zo', type: 'dakuten' },
  { key: 'da', hira: 'だ', kata: 'ダ', romaji: 'da', type: 'dakuten' },
  { key: 'di', hira: 'ぢ', kata: 'ヂ', romaji: 'ji', alt: ['di'], type: 'dakuten' },
  { key: 'du', hira: 'づ', kata: 'ヅ', romaji: 'zu', alt: ['du'], type: 'dakuten' },
  { key: 'de', hira: 'で', kata: 'デ', romaji: 'de', type: 'dakuten' },
  { key: 'do', hira: 'ど', kata: 'ド', romaji: 'do', type: 'dakuten' },
  { key: 'ba', hira: 'ば', kata: 'バ', romaji: 'ba', type: 'dakuten' },
  { key: 'bi', hira: 'び', kata: 'ビ', romaji: 'bi', type: 'dakuten' },
  { key: 'bu', hira: 'ぶ', kata: 'ブ', romaji: 'bu', type: 'dakuten' },
  { key: 'be', hira: 'べ', kata: 'ベ', romaji: 'be', type: 'dakuten' },
  { key: 'bo', hira: 'ぼ', kata: 'ボ', romaji: 'bo', type: 'dakuten' },
];

// --- Handakuten --------------------------------------------------------------
const HANDAKUTEN: Row[] = [
  { key: 'pa', hira: 'ぱ', kata: 'パ', romaji: 'pa', type: 'handakuten' },
  { key: 'pi', hira: 'ぴ', kata: 'ピ', romaji: 'pi', type: 'handakuten' },
  { key: 'pu', hira: 'ぷ', kata: 'プ', romaji: 'pu', type: 'handakuten' },
  { key: 'pe', hira: 'ぺ', kata: 'ペ', romaji: 'pe', type: 'handakuten' },
  { key: 'po', hira: 'ぽ', kata: 'ポ', romaji: 'po', type: 'handakuten' },
];

// --- Contracted sounds (yōon / きょ-style combos) ----------------------------
const COMBO: Row[] = [
  { key: 'kya', hira: 'きゃ', kata: 'キャ', romaji: 'kya', type: 'combo' },
  { key: 'kyu', hira: 'きゅ', kata: 'キュ', romaji: 'kyu', type: 'combo' },
  { key: 'kyo', hira: 'きょ', kata: 'キョ', romaji: 'kyo', type: 'combo' },
  { key: 'sha', hira: 'しゃ', kata: 'シャ', romaji: 'sha', alt: ['sya'], type: 'combo' },
  { key: 'shu', hira: 'しゅ', kata: 'シュ', romaji: 'shu', alt: ['syu'], type: 'combo' },
  { key: 'sho', hira: 'しょ', kata: 'ショ', romaji: 'sho', alt: ['syo'], type: 'combo' },
  { key: 'cha', hira: 'ちゃ', kata: 'チャ', romaji: 'cha', alt: ['tya'], type: 'combo' },
  { key: 'chu', hira: 'ちゅ', kata: 'チュ', romaji: 'chu', alt: ['tyu'], type: 'combo' },
  { key: 'cho', hira: 'ちょ', kata: 'チョ', romaji: 'cho', alt: ['tyo'], type: 'combo' },
  { key: 'nya', hira: 'にゃ', kata: 'ニャ', romaji: 'nya', type: 'combo' },
  { key: 'nyu', hira: 'にゅ', kata: 'ニュ', romaji: 'nyu', type: 'combo' },
  { key: 'nyo', hira: 'にょ', kata: 'ニョ', romaji: 'nyo', type: 'combo' },
  { key: 'hya', hira: 'ひゃ', kata: 'ヒャ', romaji: 'hya', type: 'combo' },
  { key: 'hyu', hira: 'ひゅ', kata: 'ヒュ', romaji: 'hyu', type: 'combo' },
  { key: 'hyo', hira: 'ひょ', kata: 'ヒョ', romaji: 'hyo', type: 'combo' },
  { key: 'mya', hira: 'みゃ', kata: 'ミャ', romaji: 'mya', type: 'combo' },
  { key: 'myu', hira: 'みゅ', kata: 'ミュ', romaji: 'myu', type: 'combo' },
  { key: 'myo', hira: 'みょ', kata: 'ミョ', romaji: 'myo', type: 'combo' },
  { key: 'rya', hira: 'りゃ', kata: 'リャ', romaji: 'rya', type: 'combo' },
  { key: 'ryu', hira: 'りゅ', kata: 'リュ', romaji: 'ryu', type: 'combo' },
  { key: 'ryo', hira: 'りょ', kata: 'リョ', romaji: 'ryo', type: 'combo' },
  { key: 'gya', hira: 'ぎゃ', kata: 'ギャ', romaji: 'gya', type: 'combo' },
  { key: 'gyu', hira: 'ぎゅ', kata: 'ギュ', romaji: 'gyu', type: 'combo' },
  { key: 'gyo', hira: 'ぎょ', kata: 'ギョ', romaji: 'gyo', type: 'combo' },
  { key: 'ja', hira: 'じゃ', kata: 'ジャ', romaji: 'ja', alt: ['jya', 'zya'], type: 'combo' },
  { key: 'ju', hira: 'じゅ', kata: 'ジュ', romaji: 'ju', alt: ['jyu', 'zyu'], type: 'combo' },
  { key: 'jo', hira: 'じょ', kata: 'ジョ', romaji: 'jo', alt: ['jyo', 'zyo'], type: 'combo' },
  { key: 'bya', hira: 'びゃ', kata: 'ビャ', romaji: 'bya', type: 'combo' },
  { key: 'byu', hira: 'びゅ', kata: 'ビュ', romaji: 'byu', type: 'combo' },
  { key: 'byo', hira: 'びょ', kata: 'ビョ', romaji: 'byo', type: 'combo' },
  { key: 'pya', hira: 'ぴゃ', kata: 'ピャ', romaji: 'pya', type: 'combo' },
  { key: 'pyu', hira: 'ぴゅ', kata: 'ピュ', romaji: 'pyu', type: 'combo' },
  { key: 'pyo', hira: 'ぴょ', kata: 'ピョ', romaji: 'pyo', type: 'combo' },
];

const ALL_ROWS: Row[] = [...BASE, ...DAKUTEN, ...HANDAKUTEN, ...COMBO];

type KanaSeed = Omit<Kana, 'active' | 'hesitant' | 'rtHistory' | 'srs'>;

function toCards(row: Row): KanaSeed[] {
  const make = (script: KanaScript, char: string, cf?: string): KanaSeed => ({
    id: `${script === 'hiragana' ? 'h' : 'k'}-${row.key}`,
    char,
    romaji: row.romaji,
    altRomaji: row.alt,
    script,
    type: row.type,
    confusionGroup: cf,
  });
  return [
    make('hiragana', row.hira, row.cf?.[0]),
    make('katakana', row.kata, row.cf?.[1]),
  ];
}

/** The full kana pool as static descriptors (no SRS state yet). */
export const KANA_SEED: KanaSeed[] = ALL_ROWS.flatMap(toCards);

export const KANA_COUNTS = {
  total: KANA_SEED.length,
  hiragana: KANA_SEED.filter((k) => k.script === 'hiragana').length,
  katakana: KANA_SEED.filter((k) => k.script === 'katakana').length,
};
