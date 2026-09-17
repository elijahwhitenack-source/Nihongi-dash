import { useEffect, useRef, useState } from 'react';
import { db } from '../db/db';
import type { Grammar, ItemType, Kana, Rating, Vocab } from '../db/types';
import { dueItems, newItems } from '../study/queue';
import { gradeItem } from '../study/grade';
import { recordStudy } from '../study/session';
import { shuffle } from '../lib/util';
import { kanaToRomaji } from '../lib/romaji';

type Entry =
  | { type: 'kana'; item: Kana }
  | { type: 'vocab'; item: Vocab }
  | { type: 'grammar'; item: Grammar };

interface Props {
  include: ItemType[];
  newCap: number;
  label: string;
  onExit: () => void;
}

export function DailyReview({ include, newCap, label, onExit }: Props) {
  const [queue, setQueue] = useState<Entry[]>([]);
  const [ready, setReady] = useState(false);
  const [pos, setPos] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState({ reps: 0, correct: 0 });
  const grammarTitles = useRef<Record<string, string>>({});

  const startedAt = useRef(Date.now());
  const statsRef = useRef(stats);
  statsRef.current = stats;
  const recorded = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const now = Date.now();
      const due: Entry[] = [];
      const fresh: Entry[] = [];

      if (include.includes('kana')) {
        const all = await db.kana.toArray();
        dueItems(all, now).forEach((k) => due.push({ type: 'kana', item: k }));
        newItems(all).forEach((k) => fresh.push({ type: 'kana', item: k }));
      }
      if (include.includes('vocab')) {
        const all = await db.vocab.toArray();
        dueItems(all, now).forEach((v) => due.push({ type: 'vocab', item: v }));
        newItems(all).forEach((v) => fresh.push({ type: 'vocab', item: v }));
      }
      if (include.includes('grammar')) {
        const all = await db.grammar.toArray();
        grammarTitles.current = Object.fromEntries(all.map((g) => [g.id, g.title]));
        dueItems(all, now).forEach((g) => due.push({ type: 'grammar', item: g }));
        newItems(all).forEach((g) => fresh.push({ type: 'grammar', item: g }));
      }
      if (cancelled) return;

      setQueue([...shuffle(due), ...shuffle(fresh).slice(0, newCap)]);
      startedAt.current = Date.now();
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logTime = async () => {
    if (recorded.current) return;
    recorded.current = true;
    const reps = statsRef.current.reps;
    if (reps <= 0) return;
    await recordStudy({
      minutes: (Date.now() - startedAt.current) / 60000,
      module: label,
      itemsReviewed: reps,
    });
  };
  useEffect(() => () => void logTime(), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => setRevealed(false), [pos]);

  if (!ready) return <p className="center-empty">Loading…</p>;

  const finish = async () => {
    await logTime();
    onExit();
  };

  const entry = queue[pos];
  if (!entry) {
    return (
      <div>
        <div className="center-empty">
          <div className="big">✓</div>
          <p>
            {queue.length === 0
              ? 'Nothing to review right now.'
              : `Done — ${stats.correct}/${stats.reps} recalled.`}
          </p>
        </div>
        <button className="btn" onClick={finish}>
          Done
        </button>
      </div>
    );
  }

  const grade = async (rating: Rating) => {
    await gradeItem(entry.type, entry.item, rating);
    setStats((s) => ({ reps: s.reps + 1, correct: s.correct + (rating > 1 ? 1 : 0) }));
    if (rating === 1) {
      setQueue((q) => {
        const next = [...q];
        next.splice(Math.min(pos + 3, next.length), 0, entry);
        return next;
      });
    }
    setPos((p) => p + 1);
  };

  return (
    <div>
      <div className="drill-top">
        <span>
          {pos + 1}/{queue.length} · {entry.type}
        </span>
        <button className="quit" onClick={finish}>
          End
        </button>
      </div>

      {entry.type === 'grammar'
        ? renderGrammar(entry.item, revealed, grammarTitles.current)
        : renderGlyph(entry, revealed, () => setRevealed(true))}

      {!revealed ? (
        <button className="btn" onClick={() => setRevealed(true)}>
          Show answer
        </button>
      ) : (
        <div className="grade-row">
          <button className="g-again" onClick={() => grade(1)}>
            Again
          </button>
          <button className="g-hard" onClick={() => grade(2)}>
            Hard
          </button>
          <button className="g-good" onClick={() => grade(3)}>
            Good
          </button>
          <button className="g-easy" onClick={() => grade(4)}>
            Easy
          </button>
        </div>
      )}
    </div>
  );
}

function renderGlyph(
  entry: { type: 'kana'; item: Kana } | { type: 'vocab'; item: Vocab },
  revealed: boolean,
  onReveal: () => void,
) {
  const isKana = entry.type === 'kana';
  const text = isKana ? entry.item.char : entry.item.word;
  const combo = isKana && entry.item.type === 'combo';
  const sub = isKana
    ? `${entry.item.script} · ${entry.item.type}`
    : (entry.item.jlpt ?? 'vocab');
  return (
    <div className="kana-face" onClick={onReveal} style={{ cursor: 'pointer' }}>
      <div className={`glyph${combo ? ' combo' : ''}`}>{text}</div>
      <div className="tag">{sub}</div>
      {revealed ? (
        isKana ? (
          <div className="answer">{entry.item.romaji}</div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <div className="answer" style={{ marginTop: 0 }}>
              {entry.item.reading} · {kanaToRomaji(entry.item.reading)}
            </div>
            <div style={{ marginTop: 4 }}>{entry.item.meanings.join(', ')}</div>
          </div>
        )
      ) : (
        <div className="tag" style={{ marginTop: 18 }}>
          tap to reveal
        </div>
      )}
    </div>
  );
}

function renderGrammar(g: Grammar, revealed: boolean, titles: Record<string, string>) {
  return (
    <div className="gr-card">
      <div className="gr-pattern">{g.title}</div>
      <div className="tag" style={{ textAlign: 'center' }}>
        {g.jlpt ?? 'grammar'} · recall how it's used
      </div>
      {revealed && (
        <div className="gr-body">
          <p className="gr-structure">{g.structure}</p>
          {g.examples.map((ex, i) => (
            <div className="gr-ex" key={i}>
              <div className="jp">{ex.jp}</div>
              {ex.ro && <div className="ro">{ex.ro}</div>}
              <div className="en">{ex.en}</div>
            </div>
          ))}
          {g.notes && <p className="gr-notes">📝 {g.notes}</p>}
          {g.relatedIds.length > 0 && (
            <div className="gr-related">
              <span className="tiny muted">compare: </span>
              {g.relatedIds.map((id) => (
                <span className="pill dim" key={id}>
                  {titles[id] ?? id}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
