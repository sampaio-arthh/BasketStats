import {
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Activity,
  Download,
  Plus,
  Search,
  Upload,
} from 'lucide-react';

import { SessionCard } from './components/SessionCard';
import { SessionForm } from './components/SessionForm';
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
  SessionType,
} from './types/session';

export default function App() {
  const [sessions, setSessions] = useState<Session[]>(readSessions);
  const [type, setType] = useState<SessionType>('training');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visible = useMemo(
    () =>
      sessions
        .filter(
          (session) =>
            session.type === type &&
            session.title
              .toLocaleLowerCase('pt-BR')
              .includes(query.toLocaleLowerCase('pt-BR')),
        )
        .sort((a, b) => b.date.localeCompare(a.date)),
    [sessions, type, query],
  );

  const trainingCount = sessions.filter(
    (session) => session.type === 'training',
  ).length;

  const gameCount = sessions.filter(
    (session) => session.type === 'game',
  ).length;

  const commit = (nextSessions: Session[]) => {
    setSessions(nextSessions);
    writeSessions(nextSessions);
  };

  const add = (draft: SessionDraft) => {
    const newSession: Session = {
      ...draft,
      id: crypto.randomUUID(),
    };

    commit([newSession, ...sessions]);
    setOpen(false);
  };

  const remove = (id: string) => {
    const item = sessions.find((session) => session.id === id);

    if (!item) {
      return;
    }

    if (window.confirm(`Excluir “${item.title}”?`)) {
      commit(sessions.filter((session) => session.id !== id));
    }
  };

  const selectBackupFile = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const importedSessions = await importBackup(file);
      const shouldReplace = window.confirm(
        `O arquivo contém ${importedSessions.length} sessões. ` +
          'Deseja substituir os dados atuais pelo backup importado?',
      );

      if (shouldReplace) {
        commit(importedSessions);
        window.alert('Backup importado com sucesso.');
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível importar o arquivo.';

      window.alert(message);
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

        <nav aria-label="Categorias">
          <button
            type="button"
            className={type === 'training' ? 'active' : ''}
            onClick={() => setType('training')}
          >
            Treinos
            <span>{trainingCount}</span>
          </button>

          <button
            type="button"
            className={type === 'game' ? 'active' : ''}
            onClick={() => setType('game')}
          >
            Jogos
            <span>{gameCount}</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="button ghost full"
            onClick={() => downloadBackup(sessions)}
          >
            <Download size={17} />
            Exportar CSV
          </button>

          <button
            type="button"
            className="button ghost full"
            onClick={selectBackupFile}
          >
            <Upload size={17} />
            Importar CSV
          </button>

          <input
            ref={fileInputRef}
            className="backup-input"
            type="file"
            accept=".csv,text/csv"
            onChange={handleImport}
          />

          <p>
            Exporte um backup antes de limpar os dados do navegador.
          </p>
        </div>
      </aside>

      <main>
        <header className="page-header">
          <div>
            <span className="eyebrow">
              PAINEL DE DESEMPENHO
            </span>

            <h1>
              {type === 'training'
                ? 'Seus treinos'
                : 'Seus jogos'}
            </h1>

            <p>
              Acompanhe volume, eficiência e evolução em cada sessão.
            </p>
          </div>

          <button
            type="button"
            className="button primary"
            onClick={() => setOpen(true)}
          >
            <Plus size={19} />
            Nova sessão
          </button>
        </header>

        <Summary items={visible} />

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

              <p>
                Registre seu primeiro{' '}
                {type === 'training' ? 'treino' : 'jogo'}{' '}
                para começar a acompanhar as estatísticas.
              </p>

              <button
                type="button"
                className="button primary"
                onClick={() => setOpen(true)}
              >
                <Plus size={18} />
                Criar sessão
              </button>
            </div>
          )}
        </section>
      </main>

      <SessionForm
        open={open}
        type={type}
        onClose={() => setOpen(false)}
        onSave={add}
      />
    </div>
  );
}
