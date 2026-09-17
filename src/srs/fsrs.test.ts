import { describe, it, expect } from 'vitest';
import {
  schedule,
  newCard,
  retrievability,
  intervalDays,
  DEFAULT_W,
} from './fsrs';
import type { Rating } from '../db/types';

const T0 = Date.parse('2026-09-16T08:00:00Z');
const DAY = 86_400_000;

describe('retrievability', () => {
  it('is 1 at t=0 and decreases with time', () => {
    expect(retrievability(0, 5)).toBeCloseTo(1, 5);
    const a = retrievability(1, 5);
    const b = retrievability(10, 5);
    expect(a).toBeGreaterThan(b);
    expect(a).toBeLessThan(1);
  });

  it('equals ~0.9 after exactly one stability', () => {
    expect(retrievability(5, 5)).toBeCloseTo(0.9, 3);
    expect(retrievability(20, 20)).toBeCloseTo(0.9, 3);
  });
});

describe('intervalDays', () => {
  it('is at least 1 day and grows with stability', () => {
    expect(intervalDays(0.01, 0.9, 36500)).toBe(1);
    expect(intervalDays(50, 0.9, 36500)).toBeGreaterThan(intervalDays(5, 0.9, 36500));
  });

  it('is ~1 stability at 90% requested retention', () => {
    // by construction R(S,S)=0.9, so the interval at r=0.9 is ~S
    expect(intervalDays(30, 0.9, 36500)).toBe(30);
  });

  it('respects the maximum interval', () => {
    expect(intervalDays(100000, 0.9, 365)).toBe(365);
  });
});

describe('schedule — first review of a new card', () => {
  const rate = (g: Rating) => schedule(newCard(T0), g, T0);

  it('orders intervals Again ≤ Hard ≤ Good ≤ Easy', () => {
    const again = rate(1).scheduledDays;
    const hard = rate(2).scheduledDays;
    const good = rate(3).scheduledDays;
    const easy = rate(4).scheduledDays;
    expect(again).toBeLessThanOrEqual(hard);
    expect(hard).toBeLessThanOrEqual(good);
    expect(good).toBeLessThanOrEqual(easy);
    expect(easy).toBeGreaterThan(again);
  });

  it('sets difficulty within [1,10] and Easy is easier than Again', () => {
    const easyD = rate(4).state.difficulty;
    const againD = rate(1).state.difficulty;
    for (const g of [1, 2, 3, 4] as Rating[]) {
      const d = rate(g).state.difficulty;
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(10);
    }
    expect(easyD).toBeLessThan(againD);
  });

  it('advances reps and schedules the due date into the future', () => {
    const res = rate(3);
    expect(res.state.reps).toBe(1);
    expect(res.state.due).toBeGreaterThan(T0);
    expect(res.state.lastReview).toBe(T0);
  });
});

describe('schedule — subsequent reviews', () => {
  it('Good repeatedly grows stability and lengthens intervals', () => {
    let s = schedule(newCard(T0), 3, T0).state;
    let prevInterval = 0;
    let when = T0;
    for (let i = 0; i < 5; i++) {
      when = s.due; // review exactly when due
      const res = schedule(s, 3, when);
      expect(res.state.stability).toBeGreaterThan(s.stability);
      expect(res.scheduledDays).toBeGreaterThanOrEqual(prevInterval);
      prevInterval = res.scheduledDays;
      s = res.state;
    }
  });

  it('Again counts a lapse and does not increase stability', () => {
    const first = schedule(newCard(T0), 3, T0).state;
    const when = first.due;
    const lapse = schedule(first, 1, when);
    expect(lapse.state.lapses).toBe(1);
    expect(lapse.state.phase).toBe('relearning');
    expect(lapse.state.stability).toBeLessThanOrEqual(first.stability);
  });

  it('a card reviewed late (lower retrievability) gains more stability', () => {
    const base = schedule(newCard(T0), 3, T0).state;
    const onTime = schedule(base, 3, base.lastReview! + base.stability * DAY);
    const late = schedule(base, 3, base.lastReview! + base.stability * 3 * DAY);
    expect(late.state.stability).toBeGreaterThan(onTime.state.stability);
  });
});

describe('parameters', () => {
  it('ships the 19 published FSRS-5 weights', () => {
    expect(DEFAULT_W).toHaveLength(19);
  });
});
