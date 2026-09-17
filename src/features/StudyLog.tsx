import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { recordStudy } from '../study/session';

const MODULES = ['Kana', 'Vocab', 'Grammar', 'Kanji', 'Conversation practice', 'Other'];

export function StudyLog() {
  const sessions = useLiveQuery(
    () => db.sessions.orderBy('startedAt').reverse().limit(30).toArray(),
    [],
    [],
  );
  const [minutes, setMinutes] = useState('30');
  const [moduleName, setModuleName] = useState(MODULES[0]);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const submit = async () => {
    const m = parseInt(minutes, 10);
    if (!m || m <= 0) return;
    await recordStudy({ minutes: m, module: moduleName, itemsReviewed: 0, notes });
    setNotes('');
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div>
      <div className="panel">
        <div className="section-title" style={{ marginTop: 0 }}>
          Log a session
        </div>
        <label className="field">
          <span className="cap">Minutes</span>
          <input
            className="text"
            type="number"
            inputMode="numeric"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="cap">What did you work on?</span>
          <select className="text" value={moduleName} onChange={(e) => setModuleName(e.target.value)}>
            {MODULES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="cap">Notes (takeaways, corrections, questions)</span>
          <textarea
            className="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. mixed up は/が as topic vs subject with spouse — review"
          />
        </label>
        <button className="btn" onClick={submit}>
          {saved ? 'Saved ✓' : 'Save session'}
        </button>
        <p className="tiny muted" style={{ marginTop: 8 }}>
          Drills log their own time automatically. Use this for external practice (video, live
          conversation) so the hours-vs-target picture stays honest.
        </p>
      </div>

      <div className="section-title">Recent sessions</div>
      {sessions.length === 0 && <p className="center-empty">Nothing logged yet.</p>}
      {sessions.map((s) => (
        <div className="panel" key={s.id} style={{ padding: '12px 14px', marginBottom: 8 }}>
          <div className="row" style={{ padding: 0, borderBottom: 'none' }}>
            <span className="r-main">{s.modules.join(', ')}</span>
            <span className="r-sub">
              {s.durationMin}m · {s.date}
            </span>
          </div>
          {s.notes && <p className="tiny muted" style={{ margin: '6px 0 0' }}>{s.notes}</p>}
        </div>
      ))}
    </div>
  );
}
