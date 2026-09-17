// Study session logging (spec §4, §6.7). Auto-logs time spent in drills and
// accepts manual entries (e.g. live practice with a native speaker).

import { db } from '../db/db';
import { todayKey } from '../lib/util';
import type { StudySession } from '../db/types';

export interface StudyRecord {
  minutes: number;
  module: string;        // e.g. "Kana · confusion"
  itemsReviewed: number;
  notes?: string;
  now?: number;
}

/** Append a study session row. */
export async function recordStudy(rec: StudyRecord): Promise<number> {
  const now = rec.now ?? Date.now();
  const session: StudySession = {
    date: todayKey(new Date(now)),
    startedAt: now - rec.minutes * 60000,
    endedAt: now,
    durationMin: Math.max(0, Math.round(rec.minutes)),
    modules: [rec.module],
    itemsReviewed: rec.itemsReviewed,
    notes: rec.notes ?? '',
  };
  return db.sessions.add(session);
}

export async function totalHours(): Promise<number> {
  const all = await db.sessions.toArray();
  return all.reduce((sum, s) => sum + s.durationMin, 0) / 60;
}
