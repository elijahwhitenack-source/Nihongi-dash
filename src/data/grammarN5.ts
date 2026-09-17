// ---------------------------------------------------------------------------
// Starter N5 grammar points (spec §6.3). Explanations are my own wording, not
// copied from BunPro / Tae Kim / anywhere. Teineigo (polite) baseline. This
// seeds the notebook so the module is usable immediately; I add my own points
// and notes through the app on top of this.
// ---------------------------------------------------------------------------

import type { Grammar } from '../db/types';

type GrammarSeed = Omit<Grammar, 'active' | 'srs'>;

const ROWS: Omit<GrammarSeed, 'jlpt' | 'notes'>[] = [
  {
    id: 'g-desu',
    title: '〜です',
    structure:
      'Polite copula. Links two nouns as "A is B" and marks polite (teineigo) speech. Attaches to a noun or na-adjective at the end of a sentence.',
    examples: [
      { jp: '私は学生です。', ro: 'watashi wa gakusei desu.', en: 'I am a student.' },
      { jp: 'これは水です。', ro: 'kore wa mizu desu.', en: 'This is water.' },
    ],
    relatedIds: ['g-wa'],
  },
  {
    id: 'g-wa',
    title: '〜は (topic)',
    structure:
      'Marks the topic — what the sentence is about ("as for X"). Often lines up with the English subject, but grammatically it sets the theme, not the grammatical subject. The key N5 contrast is は vs が.',
    examples: [
      { jp: '私は日本語を勉強します。', ro: 'watashi wa nihongo o benkyou shimasu.', en: 'As for me, I study Japanese.' },
    ],
    relatedIds: ['g-ga', 'g-mo'],
  },
  {
    id: 'g-ga',
    title: '〜が (subject)',
    structure:
      'Marks the grammatical subject — used for new information, existence, and answering "who/what". Where は sets a known theme, が puts the focus on the subject itself.',
    examples: [
      { jp: '猫がいます。', ro: 'neko ga imasu.', en: 'There is a cat.' },
      { jp: '誰が来ますか。', ro: 'dare ga kimasu ka.', en: 'Who is coming?' },
    ],
    relatedIds: ['g-wa'],
  },
  {
    id: 'g-no',
    title: '〜の (linking / possessive)',
    structure:
      'Joins two nouns: "A の B" = the B belonging to or associated with A ("A\'s B"). Also links nouns to describe one another.',
    examples: [
      { jp: '私の本', ro: 'watashi no hon', en: 'my book' },
      { jp: '日本語の先生', ro: 'nihongo no sensei', en: 'a teacher of Japanese' },
    ],
    relatedIds: [],
  },
  {
    id: 'g-o',
    title: '〜を (object)',
    structure:
      'Marks the direct object — the thing an action is done to. Sits right before the verb.',
    examples: [
      { jp: 'ご飯を食べます。', ro: 'gohan o tabemasu.', en: 'I eat a meal.' },
      { jp: '本を読みます。', ro: 'hon o yomimasu.', en: 'I read a book.' },
    ],
    relatedIds: [],
  },
  {
    id: 'g-ni',
    title: '〜に (destination / time)',
    structure:
      'Marks a destination (with 行く / 来る), a specific point in time, or the location where something exists (with あります / います).',
    examples: [
      { jp: '学校に行きます。', ro: 'gakkou ni ikimasu.', en: 'I go to school.' },
      { jp: '七時に起きます。', ro: 'shichi-ji ni okimasu.', en: 'I get up at seven.' },
    ],
    relatedIds: [],
  },
  {
    id: 'g-ka',
    title: '〜か (question)',
    structure:
      'Sentence-final particle that turns a polite statement into a question. In formal writing no question mark is needed.',
    examples: [{ jp: '学生ですか。', ro: 'gakusei desu ka.', en: 'Are you a student?' }],
    relatedIds: [],
  },
  {
    id: 'g-masu',
    title: '〜ます (polite non-past)',
    structure:
      'Polite verb ending for present and future actions (teineigo). Attaches to the verb stem. The negative is 〜ません.',
    examples: [
      { jp: '食べます。', ro: 'tabemasu.', en: 'I eat / will eat.' },
      { jp: '行きません。', ro: 'ikimasen.', en: "I don't / won't go." },
    ],
    relatedIds: ['g-mashita'],
  },
  {
    id: 'g-mashita',
    title: '〜ました (polite past)',
    structure:
      'Polite past tense — a completed action. Attaches to the verb stem. The negative is 〜ませんでした.',
    examples: [{ jp: '買いました。', ro: 'kaimashita.', en: 'I bought it.' }],
    relatedIds: ['g-masu'],
  },
  {
    id: 'g-mo',
    title: '〜も (also / too)',
    structure:
      'Replaces は or が to mean "also / too". "X も" = "X as well".',
    examples: [{ jp: '私も行きます。', ro: 'watashi mo ikimasu.', en: 'I will go too.' }],
    relatedIds: ['g-wa'],
  },
];

export const GRAMMAR_N5_SEED: GrammarSeed[] = ROWS.map((r) => ({
  ...r,
  jlpt: 'N5',
  notes: '',
}));
