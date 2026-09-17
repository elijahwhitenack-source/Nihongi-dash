// Generic due/new selection shared by every SRS item type (spec §5: one
// scheduler, unified queues, but per-type due dates preserved).

import type { SrsState } from '../db/types';

export interface SrsItem {
  srs: SrsState;
  active: boolean;
}

export function dueItems<T extends SrsItem>(all: T[], now: number): T[] {
  return all
    .filter((it) => it.active && it.srs.phase !== 'new' && it.srs.due <= now)
    .sort((a, b) => a.srs.due - b.srs.due);
}

export function newItems<T extends SrsItem>(all: T[]): T[] {
  return all.filter((it) => it.active && it.srs.phase === 'new');
}

export function seenItems<T extends SrsItem>(all: T[]): T[] {
  return all.filter((it) => it.active && it.srs.phase !== 'new');
}
