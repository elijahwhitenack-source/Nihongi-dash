import { useEffect, useMemo, useRef, useState } from 'react';
import type { Kana, Rating } from '../db/types';
import { db } from '../db/db';
import { buildQueue, distractors, type DrillMode, type ScriptFilter } from '../study/select';
import { applyKanaReview, baselineRt } from '../study/review';
import { autoGrade } from '../study/autograde';
import { recordStudy } from '../study/session';
import { shuffle } from '../lib/util';

export type AnswerMethod = 'mc' | 'type';

interface Props {
  mode: DrillMode;
  script: ScriptFilter;
  method: AnswerMethod;
  manualGrade: boolean; // Due Review uses the explicit 4-button scale
  onExit: () => void;
}

interface Snapshot {
  queue: Kana[];
  all: Kana[];
  baseline: number;
}

const norm = (s: string) => s.trim().toLowerCase();

function accepts(card: Kana, input: string): boolean {
  const v = norm(input);
  return v === card.romaji || (card.altRomaji ?? []).some((a) => a === v);
}

export function DrillRunner({ mode, script, method, manualGrade, onExit }: Props) {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [pos, setPos] = useState(0);
  const [queue, setQueue] = useState<Kana[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const [stats, setStats] = useState({ reps: 0, correct: 0 });

  const shownAt = useRef(0);
  const startedAt = useRef(Date.now());
  const advanceTimer = useRef<number | undefined>(undefined);
  const statsRef = useRef(stats);
  statsRef.current = stats;
  const recorded = useRef(false);

  // Log elapsed study time exactly once — on finish OR on unmount (e.g. the
  // user taps another tab mid-drill), so hours-tracking stays honest.
  const logTime = async () => {
    if (recorded.current) return;
    recorded.current = true;
    const reps = statsRef.current.reps;
    if (reps <= 0) return;
    await recordStudy({
      minutes: (Date.now() - startedAt.current) / 60000,
      module: `Kana · ${mode}`,
      itemsReviewed: reps,
    });
  };
  useEffect(() => () => void logTime(), []); // eslint-disable-line react-hooks/exhaustive-deps

  // Build the queue once from a snapshot so live DB writes don't reshuffle mid-drill.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const all = await db.kana.toArray();
      if (cancelled) return;
      const q = buildQueue(all, { mode, script, now: Date.now() });
      setSnap({ queue: q, all, baseline: baselineRt(all) });
      setQueue(q);
      startedAt.current = Date.now();
    })();
    return () => {
      cancelled = true;
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, [mode, script]);

  const card: Kana | undefined = queue[pos];

  // Reset per-question timer whenever a new card is shown.
  useEffect(() => {
    shownAt.current = Date.now();
    setRevealed(false);
    setLastCorrect(null);
    setChosen(null);
    setTyped('');
  }, [pos]);

  const options = useMemo(() => {
    if (!card || !snap || method !== 'mc') return [];
    return shuffle([card.romaji, ...distractors(card, snap.all, 3)]);
  }, [card, snap, method]);

  if (!snap) return <p className="center-empty">Loading…</p>;

  const finish = async () => {
    await logTime();
    onExit();
  };

  if (!card) {
    return (
      <div>
        <div className="center-empty">
          <div className="big">✓</div>
          <p>
            {queue.length === 0
              ? mode === 'due'
                ? 'Nothing due right now.'
                : 'No cards match this drill yet.'
              : `Done — ${stats.correct}/${stats.reps} correct.`}
          </p>
        </div>
        <button className="btn" onClick={finish}>
          Back to Kana
        </button>
      </div>
    );
  }

  const commit = async (rating: Rating, correct: boolean, responseMs: number) => {
    const updated = await applyKanaReview({
      card,
      rating,
      responseMs,
      all: snap.all,
    });
    // keep snapshot pool current for baseline drift
    snap.all = snap.all.map((k) => (k.id === updated.id ? updated : k));

    setStats((s) => ({ reps: s.reps + 1, correct: s.correct + (correct ? 1 : 0) }));

    // In-session requeue: a missed card comes back a few positions later,
    // independent of the day-level FSRS due date.
    if (rating === 1) {
      setQueue((q) => {
        const next = [...q];
        const insertAt = Math.min(pos + 3, next.length);
        next.splice(insertAt, 0, card);
        return next;
      });
    }
    setPos((p) => p + 1);
  };

  const reveal = (correct: boolean) => {
    setRevealed(true);
    setLastCorrect(correct);
  };

  const onChoose = (choice: string) => {
    if (revealed) return;
    const correct = choice === card.romaji;
    const rt = Date.now() - shownAt.current;
    setChosen(choice);
    reveal(correct);
    if (manualGrade) return; // wait for the 4-button grade
    const rating = autoGrade(correct, rt, snap.baseline);
    advanceTimer.current = window.setTimeout(
      () => void commit(rating, correct, rt),
      correct ? 550 : 1200,
    );
  };

  const onSubmitTyped = () => {
    if (revealed || !typed.trim()) return;
    const correct = accepts(card, typed);
    const rt = Date.now() - shownAt.current;
    reveal(correct);
    if (manualGrade) return;
    const rating = autoGrade(correct, rt, snap.baseline);
    advanceTimer.current = window.setTimeout(
      () => void commit(rating, correct, rt),
      correct ? 550 : 1200,
    );
  };

  const onManualGrade = (rating: Rating) => {
    const rt = Date.now() - shownAt.current;
    void commit(rating, rating !== 1, rt);
  };

  const isCombo = card.type === 'combo';

  return (
    <div>
      <div className="drill-top">
        <span>
          {pos + 1}/{queue.length} · {stats.correct}/{stats.reps} correct
        </span>
        <button className="quit" onClick={finish}>
          End drill
        </button>
      </div>

      <div className="kana-face">
        <div className={`glyph${isCombo ? ' combo' : ''}`}>{card.char}</div>
        <div className="tag">
          {card.script} · {card.type}
          {card.hesitant ? ' · shaky' : ''}
        </div>
        {revealed && <div className="answer">{card.romaji}</div>}
      </div>

      {method === 'mc' && (
        <div className="opt-grid">
          {options.map((o) => {
            let cls = '';
            if (revealed) {
              if (o === card.romaji) cls = ' correct';
              else if (o === chosen) cls = ' wrong';
            }
            return (
              <button
                key={o}
                className={`opt${cls}`}
                disabled={revealed}
                onClick={() => onChoose(o)}
              >
                {o}
              </button>
            );
          })}
        </div>
      )}

      {method === 'type' && (
        <div>
          <input
            className={`type-input${revealed ? (lastCorrect ? ' correct' : ' wrong') : ''}`}
            value={typed}
            autoFocus
            autoCapitalize="off"
            autoComplete="off"
            spellCheck={false}
            placeholder="type romaji…"
            disabled={revealed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSubmitTyped();
            }}
          />
          {!revealed && (
            <button className="btn" style={{ marginTop: 10 }} onClick={onSubmitTyped}>
              Check
            </button>
          )}
        </div>
      )}

      {revealed && (
        <div className={`verdict ${lastCorrect ? 'right' : 'wrong'}`}>
          {lastCorrect ? '✓ Correct' : `✗ ${card.char} = ${card.romaji}`}
        </div>
      )}

      {revealed && manualGrade && (
        <div className="grade-row" style={{ marginTop: 8 }}>
          <button className="g-again" onClick={() => onManualGrade(1)}>
            Again
          </button>
          <button className="g-hard" onClick={() => onManualGrade(2)}>
            Hard
          </button>
          <button className="g-good" onClick={() => onManualGrade(3)}>
            Good
          </button>
          <button className="g-easy" onClick={() => onManualGrade(4)}>
            Easy
          </button>
        </div>
      )}
    </div>
  );
}
