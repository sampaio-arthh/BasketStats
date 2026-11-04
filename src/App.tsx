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
  mergeSessions,
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
    if (view === 'game') {
      return session.type === 'game';
    }

    if (view === 'free') {
      return (
        session.type === 'training' &&
        session.trainingType === 'free'
      );
    }

    return (
      session.type === 'training' &&
      session.trainingType === 'shooting' &&
      session.shootingType === (view === 'ft' ? 'FT' : '3PT')
    );
  };

  const visible = useMemo(
    () =>
      sessions
        .filter(
          (session) =>
            matchesView(session) &&
            session.title
              .toLocaleLowerCase('pt-BR')
              .includes(query.toLocaleLowerCase('pt-BR')),
        )
        .sort((a, b) => {
          const dateComparison = b.date.localeCompare(a.date);
          return dateComparison !== 0
            ? dateComparison
            : b.createdAt.localeCompare(a.createdAt);
        }),
    [sessions, view, query],
  );

  const count = (target: ViewType) =>
    sessions.filter((session) => {
      if (target === 'game') {
        return session.type === 'game';
      }

      if (target === 'free') {
        return (
          session.type === 'training' &&
          session.trainingType === 'free'
        );
      }

      return (
        session.type === 'training' &&
        session.trainingType === 'shooting' &&
        session.shootingType === (target === 'ft' ? 'FT' : '3PT')
      );
    }).length;

  const commit = (nextSessions: Session[]) => {
    setSessions(nextSessions);
    writeSessions(nextSessions);
  };

  const add = (draft: SessionDraft) => {
    commit([
      {
        ...draft,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      },
      ...sessions,
    ]);

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

    if (!file) {
      return;
    }

    try {
      const result = await importBackup(file);
      const { summary } = result;
      const description = [
        `${summary.total} sessões encontradas`,
        `${summary.free} treinos livres`,
        `${summary.ft} treinos FT`,
        `${summary.three} treinos 3PT`,
        `${summary.games} jogos`,
      ].join('\n');

      const shouldMerge = window.confirm(
        `${description}\n\n` +
        'Clique em OK para MESCLAR com os dados atuais.\n' +
        'Clique em Cancelar para escolher entre substituir ou desistir.',
      );

      if (shouldMerge) {
        commit(mergeSessions(sessions, result.sessions));
        window.alert('Backup mesclado com sucesso.');
        return;
      }

      const shouldReplace = window.confirm(
        'Deseja SUBSTITUIR todos os dados atuais pelo backup?\n\n' +
        'OK: substituir.\nCancelar: não importar.',
      );

      if (shouldReplace) {
        commit(result.sessions);
        window.alert('Dados substituídos com sucesso.');
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

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Activity />
          </div>

          <div>
            <strong>BasketStats</strong>
            <small>Performance tracker</small>
          </div>
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
              {item === 'free'
                ? 'Livre'
                : item === 'ft'
                  ? 'Arremessos FT'
                  : 'Arremessos 3PT'}
              <span>{count(item)}</span>
            </button>
          ))}

          <span className="nav-heading nav-heading--games">JOGOS</span>

          <button
            type="button"
            className={view === 'game' ? 'active' : ''}
            onClick={() => setView('game')}
          >
            Jogos
            <span>{count('game')}</span>
          </button>

          <span className="nav-heading nav-heading--tools">FERRAMENTAS</span>

          <button type="button" onClick={() => setCounterType('FT')}>
            <span className="nav-tool-label">
              <Target size={17} />
              Contador FT
            </span>
          </button>

          <button type="button" onClick={() => setCounterType('3PT')}>
            <span className="nav-tool-label">
              <Target size={17} />
              Contador 3PT
            </span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="button ghost full"
            onClick={() => downloadBackup(sessions)}
          >
            <Download size={17} />
            Exportar JSON
          </button>

          <button
            type="button"
            className="button ghost full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={17} />
            Importar JSON
          </button>

          <input
            ref={fileInputRef}
            className="backup-input"
            type="file"
            accept=".json,application/json"
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

          <button
            type="button"
            className="button primary"
            onClick={() => setFormOpen(true)}
          >
            <Plus size={19} />
            Nova sessão
          </button>
        </header>

        <Summary items={visible} view={view} />

        <section className="history">
          <div className="history-head">
            <div>
              <h2>Histórico</h2>
              <p>{visible.length} registros encontrados</p>
            </div>

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
                <SessionCard
                  key={session.id}
                  session={session}
                  onDelete={remove}
                />
              ))}
            </div>
          ) : (
            <div className="empty">
              <div>🏀</div>
              <h3>Nenhuma sessão encontrada</h3>
              <p>Registre uma sessão para começar a acompanhar as estatísticas.</p>
              <button
                type="button"
                className="button primary"
                onClick={() => setFormOpen(true)}
              >
                <Plus size={18} />
                Criar sessão
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
