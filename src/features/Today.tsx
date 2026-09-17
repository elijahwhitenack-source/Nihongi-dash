import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { dueItems, newItems } from '../study/queue';
import { kanaStats } from './stats';
import { DailyReview } from './DailyReview';

export function Today({ goKana }: { goKana: () => void }) {
  const kana = useLiveQuery(() => db.kana.toArray(), [], []);
  const vocab = useLiveQuery(() => db.vocab.toArray(), [], []);
  const [reviewing, setReviewing] = useState(false);
  const now = Date.now();

  const { due, fresh, stats } = useMemo(
    () => ({
      due: dueItems(kana, now).length + dueItems(vocab, now).length,
      fresh: newItems(kana).length + newItems(vocab).length,
      stats: kanaStats(kana, now),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kana, vocab],
  );

  if (reviewing) {
    return (
      <DailyReview
        include={['kana', 'vocab']}
        newCap={8}
        label="Daily review"
        onExit={() => setReviewing(false)}
      />
    );
  }

  const nextDue = [...kana, ...vocab]
    .filter((k) => k.srs.phase !== 'new')
    .map((k) => k.srs.due)
    .filter((d) => d > now)
    .sort((a, b) => a - b)[0];

  const canStart = due > 0 || fresh > 0;

  return (
    <div>
      <div className="panel">
        <div className="section-title" style={{ marginTop: 0 }}>
          Daily review
        </div>
        <div className="stat-grid">
          <div className="stat">
            <b>{due}</b>
            <div className="lbl">Due now</div>
          </div>
          <div className="stat">
            <b>{fresh}</b>
            <div className="lbl">New available</div>
          </div>
        </div>
        {canStart ? (
          <button className="btn" style={{ marginTop: 12 }} onClick={() => setReviewing(true)}>
            {due > 0 ? `Start review (${due} due)` : 'Start learning'}
          </button>
        ) : (
          <p className="tiny muted" style={{ marginTop: 12 }}>
            {nextDue ? `All caught up. Next review ${relative(nextDue - now)}.` : 'Nothing scheduled yet.'}
          </p>
        )}
        <p className="tiny muted" style={{ marginTop: 8 }}>
          One queue across kana and vocab, graded Again / Hard / Good / Easy. Fast kana speed
          drills live in the Kana tab.
        </p>
      </div>

      <div className="panel">
        <div className="section-title" style={{ marginTop: 0 }}>
          Kana automaticity
        </div>
        <div className="bar">
          <i style={{ width: `${Math.round(stats.automaticFraction * 100)}%` }} />
        </div>
        <p className="tiny muted" style={{ marginTop: 8 }}>
          {stats.automatic}/{stats.totalActive} kana automatic ·{' '}
          {stats.hesitant > 0 ? `${stats.hesitant} still shaky` : 'none flagged shaky'} ·{' '}
          <button
            onClick={goKana}
            className="quit"
            style={{ padding: 0, color: 'var(--accent2)' }}
          >
            drill →
          </button>
        </p>
      </div>
    </div>
  );
}

function relative(ms: number): string {
  const min = Math.round(ms / 60000);
  if (min < 60) return `in ${min}m`;
  const h = Math.round(min / 60);
  if (h < 24) return `in ${h}h`;
  return `in ${Math.round(h / 24)}d`;
}
