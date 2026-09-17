import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { dueKana, newKana } from '../study/select';
import { kanaStats } from './stats';
import { DrillRunner } from './DrillRunner';

export function Today({ goKana }: { goKana: () => void }) {
  const all = useLiveQuery(() => db.kana.toArray(), [], []);
  const [reviewing, setReviewing] = useState(false);
  const now = Date.now();

  const { due, fresh, stats } = useMemo(
    () => ({
      due: dueKana(all, now).length,
      fresh: newKana(all).length,
      stats: kanaStats(all, now),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [all],
  );

  if (reviewing) {
    return (
      <DrillRunner
        mode="due"
        script="both"
        method="mc"
        manualGrade
        onExit={() => setReviewing(false)}
      />
    );
  }

  const nextDue = all
    .filter((k) => k.srs.phase !== 'new')
    .map((k) => k.srs.due)
    .filter((d) => d > now)
    .sort((a, b) => a - b)[0];

  return (
    <div>
      <div className="panel">
        <div className="section-title" style={{ marginTop: 0 }}>
          Today's review
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
        {due > 0 ? (
          <button className="btn" style={{ marginTop: 12 }} onClick={() => setReviewing(true)}>
            Start review ({due})
          </button>
        ) : (
          <p className="tiny muted" style={{ marginTop: 12 }}>
            {nextDue
              ? `No reviews due. Next one ${relative(nextDue - now)}.`
              : 'No reviews scheduled yet — start learning kana below.'}
          </p>
        )}
        {fresh > 0 && (
          <button className="btn secondary" style={{ marginTop: 8 }} onClick={goKana}>
            Learn new kana →
          </button>
        )}
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
          {stats.hesitant > 0 ? `${stats.hesitant} still shaky` : 'none flagged shaky'}
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
