import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { kanaStats } from './stats';
import { EXAM_DATE, EXAM_LABEL, TARGET_HOURS, PHASES, READINESS } from '../config';
import { daysUntil } from '../lib/util';

export function Dashboard() {
  const kana = useLiveQuery(() => db.kana.toArray(), [], []);
  const sessions = useLiveQuery(() => db.sessions.toArray(), [], []);

  const now = Date.now();
  const ks = kanaStats(kana, now);
  const hours = sessions.reduce((s, x) => s + x.durationMin, 0) / 60;
  const days = daysUntil(EXAM_DATE);
  const weeksLeft = Math.max(1, Math.round(days / 7));
  const hoursLeft = Math.max(0, TARGET_HOURS - hours);
  const pacePerWeek = hoursLeft / weeksLeft;

  // Current phase: kana until automaticity threshold, then parallel study.
  const phaseIdx = ks.automaticFraction >= READINESS.kanaAutomatic ? 1 : 0;

  return (
    <div>
      <div className="panel">
        <div className="section-title" style={{ marginTop: 0 }}>
          {EXAM_LABEL}
        </div>
        <div className="stat-grid">
          <div className="stat">
            <b>{days}</b>
            <div className="lbl">Days to exam</div>
            <div className="sub">{weeksLeft} weeks</div>
          </div>
          <div className="stat">
            <b>
              {hours.toFixed(1)}
              <span style={{ fontSize: '.8rem', color: 'var(--muted)' }}>/{TARGET_HOURS}h</span>
            </b>
            <div className="lbl">Hours logged</div>
            <div className="sub">{((hours / TARGET_HOURS) * 100).toFixed(1)}% of target</div>
          </div>
        </div>
        <div className="bar" style={{ marginTop: 12 }}>
          <i style={{ width: `${Math.min(100, (hours / TARGET_HOURS) * 100)}%` }} />
        </div>
        <p className="tiny muted" style={{ marginTop: 8 }}>
          {hoursLeft.toFixed(0)}h left · need <b style={{ color: 'var(--text)' }}>{pacePerWeek.toFixed(1)}h/week</b> to
          hit {TARGET_HOURS}h by exam day.
        </p>
      </div>

      <div className="panel">
        <div className="section-title" style={{ marginTop: 0 }}>
          Current phase
        </div>
        {PHASES.map((p, i) => (
          <div className="row" key={p.id}>
            <span>
              <span className="r-main">
                {i + 1}. {p.label}
              </span>
              <span className="r-sub" style={{ display: 'block' }}>
                {p.detail}
              </span>
            </span>
            <span className={`pill ${i === phaseIdx ? 'on' : 'dim'}`}>
              {i === phaseIdx ? 'now' : i < phaseIdx ? 'done' : 'later'}
            </span>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="section-title" style={{ marginTop: 0 }}>
          Kana module
        </div>
        <div className="stat-grid">
          <div className="stat">
            <b>{Math.round(ks.automaticFraction * 100)}%</b>
            <div className="lbl">Automatic</div>
            <div className="sub">target {Math.round(READINESS.kanaAutomatic * 100)}%</div>
          </div>
          <div className="stat">
            <b>{ks.seen}/{ks.totalActive}</b>
            <div className="lbl">Introduced</div>
            <div className="sub">{ks.hesitant} shaky</div>
          </div>
          <div className="stat">
            <b>{ks.hiraSeen}/{ks.hiraTotal}</b>
            <div className="lbl">Hiragana</div>
          </div>
          <div className="stat">
            <b>{ks.kataSeen}/{ks.kataTotal}</b>
            <div className="lbl">Katakana</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="section-title" style={{ marginTop: 0 }}>
          Readiness thresholds
        </div>
        <div className="row">
          <span className="r-main">Kana automatic</span>
          <span className="r-sub">
            {Math.round(ks.automaticFraction * 100)}% / {Math.round(READINESS.kanaAutomatic * 100)}%
          </span>
        </div>
        <div className="row">
          <span className="r-main">N5 vocab retained (→ N4)</span>
          <span className="r-sub">0 / {READINESS.n5VocabForN4}</span>
        </div>
        <div className="row">
          <span className="r-main">N4 grammar retained (→ N3)</span>
          <span className="r-sub">0 / {READINESS.n4GrammarForN3}</span>
        </div>
        <p className="tiny muted" style={{ marginTop: 10 }}>
          Vocab, grammar and kanji modules activate in later phases — thresholds shown so the bar
          is visible from day one.
        </p>
      </div>
    </div>
  );
}
