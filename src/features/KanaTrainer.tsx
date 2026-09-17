import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { dueKana, hesitantKana, type DrillMode, type ScriptFilter } from '../study/select';
import { DrillRunner, type AnswerMethod } from './DrillRunner';

interface Active {
  mode: DrillMode;
  manualGrade: boolean;
}

export function KanaTrainer() {
  const all = useLiveQuery(() => db.kana.toArray(), [], []);
  const [script, setScript] = useState<ScriptFilter>('both');
  const [method, setMethod] = useState<AnswerMethod>('mc');
  const [active, setActive] = useState<Active | null>(null);

  const now = Date.now();
  const counts = useMemo(() => {
    const pool = script === 'both' ? all : all.filter((k) => k.script === script);
    return {
      due: dueKana(pool, now).length,
      confusion: pool.filter((k) => k.active && k.confusionGroup).length,
      hesitant: hesitantKana(pool).length,
      total: pool.filter((k) => k.active).length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, script]);

  if (active) {
    return (
      <DrillRunner
        mode={active.mode}
        script={script}
        method={method}
        manualGrade={active.manualGrade}
        onExit={() => setActive(null)}
      />
    );
  }

  return (
    <div>
      <div className="section-title">Script</div>
      <div className="seg">
        {(['both', 'hiragana', 'katakana'] as ScriptFilter[]).map((s) => (
          <button key={s} className={script === s ? 'active' : ''} onClick={() => setScript(s)}>
            {s === 'both' ? 'Both' : s === 'hiragana' ? 'Hiragana' : 'Katakana'}
          </button>
        ))}
      </div>

      <div className="section-title">Answer with</div>
      <div className="seg">
        <button className={method === 'mc' ? 'active' : ''} onClick={() => setMethod('mc')}>
          Choose
        </button>
        <button className={method === 'type' ? 'active' : ''} onClick={() => setMethod('type')}>
          Type
        </button>
      </div>

      <div className="section-title">Drills</div>

      <ModeCard
        title="Due review"
        desc="Scheduled cards, graded Again / Hard / Good / Easy"
        count={counts.due}
        onClick={() => setActive({ mode: 'due', manualGrade: true })}
      />
      <ModeCard
        title="Recognition"
        desc="Fast timed practice — speed is graded automatically"
        count={counts.total}
        onClick={() => setActive({ mode: 'recognition', manualGrade: false })}
      />
      <ModeCard
        title="Confusion pairs"
        desc="Look-alikes: シ/ツ, ソ/ン, ね/ぬ/め/わ/れ…"
        count={counts.confusion}
        onClick={() => counts.confusion > 0 && setActive({ mode: 'confusion', manualGrade: false })}
      />
      <ModeCard
        title="Automaticity"
        desc="Only your still-shaky characters, drilled for speed"
        count={counts.hesitant}
        onClick={() => counts.hesitant > 0 && setActive({ mode: 'automaticity', manualGrade: false })}
      />
    </div>
  );
}

function ModeCard({
  title,
  desc,
  count,
  onClick,
}: {
  title: string;
  desc: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button className="mode-card" onClick={onClick} disabled={count === 0}>
      <span>
        <span className="m-title">{title}</span>
        <span className="m-desc">{desc}</span>
      </span>
      <span className={`m-count${count === 0 ? ' zero' : ''}`}>{count}</span>
    </button>
  );
}
