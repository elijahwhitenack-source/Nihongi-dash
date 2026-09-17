import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { dueItems, newItems, seenItems } from '../study/queue';
import { kanaToRomaji } from '../lib/romaji';
import { DailyReview } from './DailyReview';

const CAP = 60;

export function Vocab() {
  const all = useLiveQuery(() => db.vocab.toArray(), [], []);
  const [reviewing, setReviewing] = useState<'due' | 'new' | null>(null);
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<string>('all');
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

  const sources = useMemo(
    () => Array.from(new Set(all.map((v) => v.sourceDeck).filter(Boolean))) as string[],
    [all],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all
      .filter((v) => source === 'all' || v.sourceDeck === source)
      .filter(
        (v) =>
          !q ||
          v.word.toLowerCase().includes(q) ||
          v.reading.toLowerCase().includes(q) ||
          kanaToRomaji(v.reading).toLowerCase().includes(q) ||
          v.meanings.join(' ').toLowerCase().includes(q),
      )
      .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  }, [all, query, source]);

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
          Your Tango N5 deck (1000+ words with example sentences) is loaded. New words
          drip in as you review; SRS paces the rest.
        </p>
      </div>

      <div className="section-title">Deck ({counts.total})</div>

      {sources.length > 1 && (
        <div className="filter-row">
          <button className={source === 'all' ? 'active' : ''} onClick={() => setSource('all')}>
            All
          </button>
          {sources.map((s) => (
            <button key={s} className={source === s ? 'active' : ''} onClick={() => setSource(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <input
        className="text"
        style={{ marginBottom: 12 }}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="search word, reading, romaji, or meaning…"
      />

      {filtered.slice(0, CAP).map((v) => {
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
                <span style={{ fontSize: '.8rem', color: 'var(--accent2)' }}> · {kanaToRomaji(v.reading)}</span>
              </span>
              <span className="r-sub" style={{ display: 'block' }}>
                {v.meanings.join(', ')}
              </span>
            </span>
          </div>
        );
      })}
      {filtered.length > CAP && (
        <p className="tiny muted" style={{ marginTop: 8 }}>
          Showing {CAP} of {filtered.length}. Narrow it with search.
        </p>
      )}
      {filtered.length === 0 && <p className="center-empty">No matches.</p>}
    </div>
  );
}
