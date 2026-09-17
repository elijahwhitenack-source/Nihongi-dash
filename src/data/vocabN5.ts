// ---------------------------------------------------------------------------
// Starter N5 vocabulary (spec §6.2). Hand-authored core words with my own
// concise glosses — not scraped. This exists so the Vocab module is usable
// before importing my real Tango N5 .apkg; the importer will add to this pool.
// ---------------------------------------------------------------------------

import type { Vocab } from '../db/types';

type VocabSeed = Omit<Vocab, 'active' | 'srs'>;

interface Row {
  word: string;
  reading: string;
  meanings: string[];
  pos: string;
}

const ROWS: Row[] = [
  // people & pronouns
  { word: '私', reading: 'わたし', meanings: ['I', 'me'], pos: 'pronoun' },
  { word: 'あなた', reading: 'あなた', meanings: ['you'], pos: 'pronoun' },
  { word: '人', reading: 'ひと', meanings: ['person'], pos: 'noun' },
  { word: '友達', reading: 'ともだち', meanings: ['friend'], pos: 'noun' },
  { word: '母', reading: 'はは', meanings: ['(my) mother'], pos: 'noun' },
  { word: '父', reading: 'ちち', meanings: ['(my) father'], pos: 'noun' },
  { word: '先生', reading: 'せんせい', meanings: ['teacher'], pos: 'noun' },
  { word: '学生', reading: 'がくせい', meanings: ['student'], pos: 'noun' },
  // places & things
  { word: '日本', reading: 'にほん', meanings: ['Japan'], pos: 'noun' },
  { word: '日本語', reading: 'にほんご', meanings: ['Japanese (language)'], pos: 'noun' },
  { word: '学校', reading: 'がっこう', meanings: ['school'], pos: 'noun' },
  { word: '家', reading: 'いえ', meanings: ['house', 'home'], pos: 'noun' },
  { word: '店', reading: 'みせ', meanings: ['shop', 'store'], pos: 'noun' },
  { word: '駅', reading: 'えき', meanings: ['station'], pos: 'noun' },
  { word: '車', reading: 'くるま', meanings: ['car'], pos: 'noun' },
  { word: '電車', reading: 'でんしゃ', meanings: ['train'], pos: 'noun' },
  { word: '本', reading: 'ほん', meanings: ['book'], pos: 'noun' },
  { word: '名前', reading: 'なまえ', meanings: ['name'], pos: 'noun' },
  { word: 'お金', reading: 'おかね', meanings: ['money'], pos: 'noun' },
  // food & drink
  { word: '水', reading: 'みず', meanings: ['water'], pos: 'noun' },
  { word: 'お茶', reading: 'おちゃ', meanings: ['tea'], pos: 'noun' },
  { word: 'ご飯', reading: 'ごはん', meanings: ['rice', 'meal'], pos: 'noun' },
  { word: '肉', reading: 'にく', meanings: ['meat'], pos: 'noun' },
  { word: '魚', reading: 'さかな', meanings: ['fish'], pos: 'noun' },
  // time
  { word: '時間', reading: 'じかん', meanings: ['time', 'hour'], pos: 'noun' },
  { word: '今日', reading: 'きょう', meanings: ['today'], pos: 'noun' },
  { word: '明日', reading: 'あした', meanings: ['tomorrow'], pos: 'noun' },
  { word: '昨日', reading: 'きのう', meanings: ['yesterday'], pos: 'noun' },
  { word: '朝', reading: 'あさ', meanings: ['morning'], pos: 'noun' },
  { word: '夜', reading: 'よる', meanings: ['night'], pos: 'noun' },
  // i-adjectives
  { word: '大きい', reading: 'おおきい', meanings: ['big'], pos: 'i-adjective' },
  { word: '小さい', reading: 'ちいさい', meanings: ['small'], pos: 'i-adjective' },
  { word: '新しい', reading: 'あたらしい', meanings: ['new'], pos: 'i-adjective' },
  { word: '古い', reading: 'ふるい', meanings: ['old (thing)'], pos: 'i-adjective' },
  { word: '高い', reading: 'たかい', meanings: ['expensive', 'tall', 'high'], pos: 'i-adjective' },
  { word: '安い', reading: 'やすい', meanings: ['cheap'], pos: 'i-adjective' },
  { word: 'いい', reading: 'いい', meanings: ['good'], pos: 'i-adjective' },
  { word: '悪い', reading: 'わるい', meanings: ['bad'], pos: 'i-adjective' },
  { word: '暑い', reading: 'あつい', meanings: ['hot (weather)'], pos: 'i-adjective' },
  { word: '寒い', reading: 'さむい', meanings: ['cold (weather)'], pos: 'i-adjective' },
  // verbs
  { word: '食べる', reading: 'たべる', meanings: ['to eat'], pos: 'verb' },
  { word: '飲む', reading: 'のむ', meanings: ['to drink'], pos: 'verb' },
  { word: '行く', reading: 'いく', meanings: ['to go'], pos: 'verb' },
  { word: '来る', reading: 'くる', meanings: ['to come'], pos: 'verb' },
  { word: '見る', reading: 'みる', meanings: ['to see', 'to watch'], pos: 'verb' },
  { word: 'する', reading: 'する', meanings: ['to do'], pos: 'verb' },
  { word: '買う', reading: 'かう', meanings: ['to buy'], pos: 'verb' },
  { word: '話す', reading: 'はなす', meanings: ['to speak', 'to talk'], pos: 'verb' },
  { word: '読む', reading: 'よむ', meanings: ['to read'], pos: 'verb' },
  { word: '書く', reading: 'かく', meanings: ['to write'], pos: 'verb' },
];

export const VOCAB_N5_SEED: VocabSeed[] = ROWS.map((r, i) => ({
  id: `starter-n5-${i + 1}`,
  word: r.word,
  reading: r.reading,
  meanings: r.meanings,
  jlpt: 'N5',
  partOfSpeech: [r.pos],
  sourceDeck: 'Starter N5',
  exampleRefs: [],
}));
