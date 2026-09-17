import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { dueItems, newItems, seenItems } from '../study/queue';
import { DailyReview } from './DailyReview';

export function Vocab() {
  const all = useLiveQuery(() => db.vocab.toArray(), [], []);
  const [reviewing, setReviewing] = useState<'due' | 'new' | null>(null);
  const now = Date.now();

  const counts = useMemo(
    () => ({
      due: dueItems(all, now).length,
      fresh: newItems(all).length,
      seen: seenItems(all).length,
      total: all.filter((v) => v.active).length,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [all],
  );

  if (reviewing) {
    return (
      <DailyReview
        include={['vocab']}
        newCap={reviewing === 'new' ? 10 : 0}
        label="Vocab"
        onExit={() => setReviewing(null)}
      />
    );
  }

  return (
    <div>
      <div className="panel">
        <div className="section-title" style={{ marginTop: 0 }}>
          Vocabulary · N5
        </div>
        <div className="stat-grid">
          <div className="stat">
            <b>{counts.due}</b>
            <div className="lbl">Due</div>
          </div>
          <div className="stat">
            <b>{counts.seen}/{counts.total}</b>
            <div className="lbl">Learned</div>
            <div className="sub">{counts.fresh} new left</div>
          </div>
        </div>
        <button
          className="btn"
          style={{ marginTop: 12 }}
          disabled={counts.due === 0}
          onClick={() => setReviewing('due')}
        >
          Review due ({counts.due})
        </button>
        <button
          className="btn secondary"
          disabled={counts.fresh === 0}
          onClick={() => setReviewing('new')}
        >
          Learn new ({counts.fresh})
        </button>
        <p className="tiny muted" style={{ marginTop: 8 }}>
          Starter N5 deck. Importing your Tango N5 .apkg (next up) adds to this pool.
        </p>
      </div>

      <div className="section-title">Deck</div>
      {all
        .slice()
        .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
        .map((v) => {
          const dot =
            v.srs.phase === 'new'
              ? '⚪️'
              : v.srs.phase === 'review' && v.srs.stability >= 7
                ? '🟢'
                : v.srs.phase === 'review'
                  ? '🟡'
                  : '🔴';
          return (
            <div className="row" key={v.id}>
              <span>
                <span className="r-main">
                  {dot} {v.word}
                  <span className="muted" style={{ fontSize: '.8rem' }}> · {v.reading}</span>
                </span>
                <span className="r-sub" style={{ display: 'block' }}>
                  {v.meanings.join(', ')}
                </span>
              </span>
            </div>
          );
        })}
    </div>
  );
}
