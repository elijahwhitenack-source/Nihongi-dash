import { useEffect, useMemo, useRef, useState } from 'react';
import { db } from '../db/db';
import type { ItemType, Kana, Rating, Vocab } from '../db/types';
import { dueItems, newItems } from '../study/queue';
import { gradeItem } from '../study/grade';
import { recordStudy } from '../study/session';
import { shuffle } from '../lib/util';

type Entry = { type: 'kana'; item: Kana } | { type: 'vocab'; item: Vocab };

interface Props {
  include: ItemType[];   // which item types this session reviews
  newCap: number;        // how many new cards to introduce this session
  label: string;         // study-log module name
  onExit: () => void;
}

function frontGlyph(e: Entry): { text: string; combo: boolean; sub: string } {
  if (e.type === 'kana') {
    return { text: e.item.char, combo: e.item.type === 'combo', sub: `${e.item.script} · ${e.item.type}` };
  }
  return { text: e.item.word, combo: false, sub: e.item.jlpt ?? 'vocab' };
}

function backText(e: Entry): string {
  if (e.type === 'kana') return e.item.romaji;
  return `${e.item.reading} — ${e.item.meanings.join(', ')}`;
}

export function DailyReview({ include, newCap, label, onExit }: Props) {
  const [queue, setQueue] = useState<Entry[]>([]);
  const [ready, setReady] = useState(false);
  const [pos, setPos] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState({ reps: 0, correct: 0 });

  const startedAt = useRef(Date.now());
  const statsRef = useRef(stats);
  statsRef.current = stats;
  const recorded = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const now = Date.now();
      const entries: Entry[] = [];
      const newEntries: Entry[] = [];

      if (include.includes('kana')) {
        const all = await db.kana.toArray();
        dueItems(all, now).forEach((k) => entries.push({ type: 'kana', item: k }));
        newItems(all).forEach((k) => newEntries.push({ type: 'kana', item: k }));
      }
      if (include.includes('vocab')) {
        const all = await db.vocab.toArray();
        dueItems(all, now).forEach((v) => entries.push({ type: 'vocab', item: v }));
        newItems(all).forEach((v) => newEntries.push({ type: 'vocab', item: v }));
      }
      if (cancelled) return;

      const q = [...shuffle(entries), ...shuffle(newEntries).slice(0, newCap)];
      setQueue(q);
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

  const entry = queue[pos];
  const gl = useMemo(() => (entry ? frontGlyph(entry) : null), [entry]);

  if (!ready) return <p className="center-empty">Loading…</p>;

  const finish = async () => {
    await logTime();
    onExit();
  };

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
      // requeue a missed card a few positions later in this session
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

      <div className="kana-face" onClick={() => setRevealed(true)} style={{ cursor: 'pointer' }}>
        <div className={`glyph${gl!.combo ? ' combo' : ''}`}>{gl!.text}</div>
        <div className="tag">{gl!.sub}</div>
        {revealed && <div className="answer">{backText(entry)}</div>}
        {!revealed && <div className="tag" style={{ marginTop: 18 }}>tap to reveal</div>}
      </div>

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
