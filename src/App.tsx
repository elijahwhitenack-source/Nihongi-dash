import { useEffect, useState } from 'react';
import { ensureSeeded } from './db/seed';
import { EXAM_DATE } from './config';
import { daysUntil } from './lib/util';
import { Today } from './features/Today';
import { KanaTrainer } from './features/KanaTrainer';
import { Dashboard } from './features/Dashboard';
import { StudyLog } from './features/StudyLog';

type Tab = 'today' | 'kana' | 'stats' | 'log';

const TABS: { id: Tab; label: string; ico: string }[] = [
  { id: 'today', label: 'Today', ico: '📅' },
  { id: 'kana', label: 'Kana', ico: 'あ' },
  { id: 'stats', label: 'Progress', ico: '📊' },
  { id: 'log', label: 'Log', ico: '✎' },
];

export function App() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('today');

  useEffect(() => {
    void ensureSeeded().then(() => setReady(true));
  }, []);

  const days = daysUntil(EXAM_DATE);

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <span>日</span> Nihongo Dash
        </h1>
        <div className="countdown">
          {EXAM_DATE.slice(0, 4)} exam
          <br />
          <b>{days}</b> days
        </div>
      </header>

      <main className="view">
        {!ready ? (
          <p className="center-empty">Preparing your deck…</p>
        ) : tab === 'today' ? (
          <Today goKana={() => setTab('kana')} />
        ) : tab === 'kana' ? (
          <KanaTrainer />
        ) : tab === 'stats' ? (
          <Dashboard />
        ) : (
          <StudyLog />
        )}
      </main>

      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id)}
          >
            <span className="ico">{t.ico}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
