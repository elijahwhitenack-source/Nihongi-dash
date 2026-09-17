import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { newCard } from '../srs/fsrs';
import { dueItems, newItems, seenItems } from '../study/queue';
import { kanaToRomaji } from '../lib/romaji';
import type { Grammar as GrammarPoint } from '../db/types';
import { DailyReview } from './DailyReview';

export function Grammar() {
  const all = useLiveQuery(() => db.grammar.toArray(), [], []);
  const [reviewing, setReviewing] = useState<'due' | 'new' | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const now = Date.now();

  const titles = useMemo(() => Object.fromEntries(all.map((g) => [g.id, g.title])), [all]);
  const counts = useMemo(
    () => ({
      due: dueItems(all, now).length,
      fresh: newItems(all).length,
      seen: seenItems(all).length,
      total: all.filter((g) => g.active).length,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [all],
  );

  if (reviewing) {
    return (
      <DailyReview
        include={['grammar']}
        newCap={reviewing === 'new' ? 5 : 0}
        label="Grammar"
        onExit={() => setReviewing(null)}
      />
    );
  }

  return (
    <div>
      <div className="panel">
        <div className="section-title" style={{ marginTop: 0 }}>
          Grammar notebook
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
      </div>

      <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Points ({counts.total})</span>
        <button
          className="quit"
          style={{ color: 'var(--accent2)', padding: 0 }}
          onClick={() => setAdding((a) => !a)}
        >
          {adding ? 'cancel' : '+ add'}
        </button>
      </div>

      {adding && <AddPointForm onDone={() => setAdding(false)} />}

      {all
        .slice()
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((g) => (
          <PointRow
            key={g.id}
            g={g}
            titles={titles}
            open={expanded === g.id}
            onToggle={() => setExpanded((e) => (e === g.id ? null : g.id))}
          />
        ))}
    </div>
  );
}

function PointRow({
  g,
  titles,
  open,
  onToggle,
}: {
  g: GrammarPoint;
  titles: Record<string, string>;
  open: boolean;
  onToggle: () => void;
}) {
  const [notes, setNotes] = useState(g.notes);
  const [savedNote, setSavedNote] = useState(false);
  const dot =
    g.srs.phase === 'new' ? '⚪️' : g.srs.phase === 'review' ? '🟢' : '🔴';

  const saveNotes = async () => {
    await db.grammar.update(g.id, { notes });
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 1200);
  };

  return (
    <div className="panel" style={{ padding: '12px 14px', marginBottom: 8 }}>
      <div
        className="row"
        style={{ padding: 0, borderBottom: 'none', cursor: 'pointer' }}
        onClick={onToggle}
      >
        <span className="r-main">
          {dot} {g.title}
        </span>
        <span className="r-sub">{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ marginTop: 10 }}>
          <p className="tiny" style={{ lineHeight: 1.55 }}>{g.structure}</p>
          {g.examples.map((ex, i) => (
            <div className="gr-ex" key={i}>
              <div className="jp" style={{ fontSize: '1rem' }}>{ex.jp}</div>
              {ex.ro && <div className="ro">{ex.ro}</div>}
              <div className="en">{ex.en}</div>
            </div>
          ))}
          {g.relatedIds.length > 0 && (
            <div className="gr-related">
              <span className="tiny muted">compare:</span>
              {g.relatedIds.map((id) => (
                <span className="pill dim" key={id}>{titles[id] ?? id}</span>
              ))}
            </div>
          )}
          <label className="field" style={{ marginTop: 12, marginBottom: 6 }}>
            <span className="cap">My notes</span>
            <textarea
              className="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="your own explanation, mnemonics, corrections…"
            />
          </label>
          <button className="btn secondary" onClick={saveNotes}>
            {savedNote ? 'Saved ✓' : 'Save notes'}
          </button>
        </div>
      )}
    </div>
  );
}

function AddPointForm({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState('');
  const [structure, setStructure] = useState('');
  const [exJp, setExJp] = useState('');
  const [exRo, setExRo] = useState('');
  const [exEn, setExEn] = useState('');
  const [notes, setNotes] = useState('');

  const save = async () => {
    if (!title.trim() || !structure.trim()) return;
    // Use the romaji I typed; otherwise auto-transliterate, but only if the
    // example is pure kana (kanji can't be transliterated reliably).
    let ro = exRo.trim();
    if (!ro && exJp.trim()) {
      const auto = kanaToRomaji(exJp.trim());
      if (!/[一-龯]/.test(auto)) ro = auto;
    }
    const point: GrammarPoint = {
      id: `user-${Date.now()}`,
      title: title.trim(),
      jlpt: undefined,
      structure: structure.trim(),
      examples: exJp.trim() ? [{ jp: exJp.trim(), ro: ro || undefined, en: exEn.trim() }] : [],
      relatedIds: [],
      notes: notes.trim(),
      active: true,
      srs: newCard(),
    };
    await db.grammar.add(point);
    onDone();
  };

  return (
    <div className="panel">
      <label className="field">
        <span className="cap">Pattern / title *</span>
        <input className="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="〜てもいいです" />
      </label>
      <label className="field">
        <span className="cap">What it does *</span>
        <textarea className="text" value={structure} onChange={(e) => setStructure(e.target.value)} placeholder="your own explanation" />
      </label>
      <label className="field">
        <span className="cap">Example (Japanese)</span>
        <input className="text" value={exJp} onChange={(e) => setExJp(e.target.value)} placeholder="ここに座ってもいいですか。" />
      </label>
      <label className="field">
        <span className="cap">Example (romaji — auto-filled if kana only)</span>
        <input className="text" value={exRo} onChange={(e) => setExRo(e.target.value)} placeholder="koko ni suwattemo ii desu ka." />
      </label>
      <label className="field">
        <span className="cap">Example (English)</span>
        <input className="text" value={exEn} onChange={(e) => setExEn(e.target.value)} placeholder="May I sit here?" />
      </label>
      <label className="field">
        <span className="cap">Notes</span>
        <textarea className="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <button className="btn" onClick={save} disabled={!title.trim() || !structure.trim()}>
        Add to notebook
      </button>
    </div>
  );
}
