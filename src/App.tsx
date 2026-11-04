import { useMemo, useRef, useState } from 'react';
import {
  Activity,
  Download,
  Plus,
  Search,
  Target,
  Upload,
} from 'lucide-react';
import { SessionCard } from './components/SessionCard';
import { SessionForm } from './components/SessionForm';
import { ShotCounter } from './components/ShotCounter';
import { Summary } from './components/Summary';
import {
  downloadBackup,
  importBackup,
  readSessions,
  writeSessions,
} from './lib/storage';
import type {
  Session,
  SessionDraft,
  ShootingType,
  ViewType,
} from './types/session';

const viewLabels: Record<ViewType, string> = {
  free: 'Treinos livres',
  ft: 'Treinos de FT',
  three: 'Treinos de 3PT',
  game: 'Seus jogos',
};

export default function App() {
  const [sessions, setSessions] = useState<Session[]>(readSessions);
  const [view, setView] = useState<ViewType>('free');
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [counterType, setCounterType] = useState<ShootingType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const matchesView = (session: Session) => {
    if (view === 'game') return session.type === 'game';
    if (view === 'free') {
      return session.type === 'training' && session.trainingType === 'free';
    }
    return session.type === 'training' &&
      session.trainingType === 'shooting' &&
      session.shootingType === (view === 'ft' ? 'FT' : '3PT');
  };

  const visible = useMemo(
    () => sessions
      .filter((session) =>
        matchesView(session) &&
        session.title.toLocaleLowerCase('pt-BR').includes(
          query.toLocaleLowerCase('pt-BR'),
        ),
      )
      .sort((a, b) => b.date.localeCompare(a.date)),
    [sessions, view, query],
  );

  const count = (target: ViewType) => sessions.filter((session) => {
    if (target === 'game') return session.type === 'game';
    if (target === 'free') {
      return session.type === 'training' && session.trainingType === 'free';
    }
    return session.type === 'training' &&
      session.trainingType === 'shooting' &&
      session.shootingType === (target === 'ft' ? 'FT' : '3PT');
  }).length;

  const commit = (nextSessions: Session[]) => {
    setSessions(nextSessions);
    writeSessions(nextSessions);
  };

  const add = (draft: SessionDraft) => {
    commit([{ ...draft, id: crypto.randomUUID() }, ...sessions]);
    setFormOpen(false);
  };

  const remove = (id: string) => {
    const item = sessions.find((session) => session.id === id);
    if (item && window.confirm(`Excluir “${item.title}”?`)) {
      commit(sessions.filter((session) => session.id !== id));
    }
  };

  const handleImport = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importBackup(file);
      if (window.confirm(
        `O arquivo contém ${imported.length} sessões. ` +
        'Deseja substituir os dados atuais?',
      )) {
        commit(imported);
        window.alert('Backup importado com sucesso.');
      }
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : 'Não foi possível importar o arquivo.',
      );
    } finally {
      event.target.value = '';
    }
  };

  const isShootingView = view === 'ft' || view === 'three';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Activity /></div>
          <div><strong>BasketStats</strong><small>Performance tracker</small></div>
        </div>

        <nav aria-label="Tipos de sessão">
          <span className="nav-heading">TREINOS</span>
          {(['free', 'ft', 'three'] as ViewType[]).map((item) => (
            <button
              type="button"
              key={item}
              className={view === item ? 'active' : ''}
              onClick={() => setView(item)}
            >
              {item === 'free' ? 'Livre' : item === 'ft' ? 'Arremessos FT' : 'Arremessos 3PT'}
              <span>{count(item)}</span>
            </button>
          ))}

          <span className="nav-heading nav-heading--games">JOGOS</span>
          <button
            type="button"
            className={view === 'game' ? 'active' : ''}
            onClick={() => setView('game')}
          >
            Jogos <span>{count('game')}</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="button ghost full" onClick={() => downloadBackup(sessions)}>
            <Download size={17} /> Exportar CSV
          </button>
          <button type="button" className="button ghost full" onClick={() => fileInputRef.current?.click()}>
            <Upload size={17} /> Importar CSV
          </button>
          <input
            ref={fileInputRef}
            className="backup-input"
            type="file"
            accept=".csv,text/csv"
            onChange={handleImport}
          />
          <p>Exporte um backup antes de limpar os dados do navegador.</p>
        </div>
      </aside>

      <main>
        <header className="page-header">
          <div>
            <span className="eyebrow">PAINEL DE DESEMPENHO</span>
            <h1>{viewLabels[view]}</h1>
            <p>Acompanhe volume, eficiência e evolução em cada sessão.</p>
          </div>

          <div className="header-actions">
            {isShootingView && (
              <button
                type="button"
                className="button ghost"
                onClick={() => setCounterType(view === 'ft' ? 'FT' : '3PT')}
              >
                <Target size={19} /> Abrir contador
              </button>
            )}
            <button type="button" className="button primary" onClick={() => setFormOpen(true)}>
              <Plus size={19} /> Nova sessão
            </button>
          </div>
        </header>

        <Summary items={visible} />

        <section className="history">
          <div className="history-head">
            <div><h2>Histórico</h2><p>{visible.length} registros encontrados</p></div>
            <label className="search">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar sessão"
                aria-label="Buscar sessão"
              />
            </label>
          </div>

          {visible.length > 0 ? (
            <div className="cards-grid">
              {visible.map((session) => (
                <SessionCard key={session.id} session={session} onDelete={remove} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <div>🏀</div>
              <h3>Nenhuma sessão encontrada</h3>
              <p>Registre uma sessão para começar a acompanhar as estatísticas.</p>
              <button type="button" className="button primary" onClick={() => setFormOpen(true)}>
                <Plus size={18} /> Criar sessão
              </button>
            </div>
          )}
        </section>
      </main>

      <SessionForm
        open={formOpen}
        view={view}
        onClose={() => setFormOpen(false)}
        onSave={add}
      />

      {counterType && (
        <ShotCounter
          open
          shootingType={counterType}
          onClose={() => setCounterType(null)}
          onSave={add}
        />
      )}
    </div>
  );
}
