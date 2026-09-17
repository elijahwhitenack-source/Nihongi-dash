import Dexie, { type Table } from 'dexie';
import type {
  Kana,
  Vocab,
  Grammar,
  Kanji,
  ReviewLog,
  StudySession,
  Meta,
} from './types';

// IndexedDB is the source of truth (spec §3): the app works fully offline and
// every module reads/writes here. Sync is a later, optional phase.
export class NihongoDB extends Dexie {
  kana!: Table<Kana, string>;
  vocab!: Table<Vocab, string>;
  grammar!: Table<Grammar, string>;
  kanji!: Table<Kanji, string>;
  reviews!: Table<ReviewLog, number>;
  sessions!: Table<StudySession, number>;
  meta!: Table<Meta, string>;

  constructor() {
    super('nihongo-dash');
    this.version(1).stores({
      // nested `srs.due` is indexed so the review queue is a fast range query
      kana: 'id, script, type, active, hesitant, confusionGroup, srs.due',
      vocab: 'id, jlpt, sourceDeck, active, srs.due',
      grammar: 'id, jlpt, active, srs.due',
      kanji: 'id, jlpt, grade, active, srs.due',
      reviews: '++id, itemType, itemId, reviewedAt, [itemType+reviewedAt]',
      sessions: '++id, date, startedAt',
      meta: 'key',
    });
  }
}

export const db = new NihongoDB();
