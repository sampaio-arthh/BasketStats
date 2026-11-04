import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { emptySession } from '../features/sessions/defaults';
import type { SessionDraft, ViewType } from '../types/session';

const commonFields = [
  ['points', 'Pontos'],
  ['assists', 'Assistências'],
  ['rebounds', 'Rebotes'],
  ['steals', 'Roubos'],
  ['blocks', 'Bloqueios'],
  ['fgMade', 'FG convertidos'],
  ['fgAttempted', 'FG tentados'],
  ['threeMade', '3PT convertidos'],
  ['threeAttempted', '3PT tentados'],
  ['ftMade', 'FT convertidos'],
  ['ftAttempted', 'FT tentados'],
] as const;

export function SessionForm({
  open,
  view,
  onClose,
  onSave,
}: {
  open: boolean;
  view: ViewType;
  onClose: () => void;
  onSave: (draft: SessionDraft) => void;
}) {
  const [draft, setDraft] = useState(() => emptySession(view));

  useEffect(() => {
    if (open) setDraft(emptySession(view));
  }, [open, view]);

  if (!open) return null;

  const isShooting = view === 'ft' || view === 'three';
  const shootingFields = view === 'ft'
    ? ([['ftMade', 'Acertos'], ['ftAttempted', 'Tentativas']] as const)
    : ([['threeMade', 'Acertos'], ['threeAttempted', 'Tentativas']] as const);
  const update = <Key extends keyof SessionDraft>(
    key: Key,
    value: SessionDraft[Key],
  ) => setDraft((current) => ({ ...current, [key]: value }));
  const fields = isShooting ? shootingFields : commonFields;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim()) return;
    onSave({ ...draft, title: draft.title.trim() });
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <form className="modal" onSubmit={submit}>
        <header>
          <div>
            <span>NOVA SESSÃO</span>
            <h2>{isShooting ? `Treino de ${view === 'ft' ? 'FT' : '3PT'}` : view === 'game' ? 'Registrar jogo' : 'Treino livre'}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            <X />
          </button>
        </header>

        <div className="form-body">
          <label className="wide">
            Nome
            <input
              autoFocus
              required
              value={draft.title}
              onChange={(event) => update('title', event.target.value)}
              placeholder={isShooting ? 'Ex.: 100 lances livres' : 'Ex.: Treino de fundamentos'}
            />
          </label>

          <label>
            Data
            <input
              type="date"
              required
              value={draft.date}
              onChange={(event) => update('date', event.target.value)}
            />
          </label>

          {view === 'game' && (
            <label>
              Local
              <input
                value={draft.location}
                onChange={(event) => update('location', event.target.value)}
                placeholder="Ex.: Ginásio municipal"
              />
            </label>
          )}

          {fields.map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={draft[key] as number}
                onChange={(event) => update(
                  key,
                  Math.max(0, Number(event.target.value) || 0),
                )}
              />
            </label>
          ))}

          <label className="wide">
            Observações
            <textarea
              rows={3}
              value={draft.notes}
              onChange={(event) => update('notes', event.target.value)}
              placeholder="Observações da sessão..."
            />
          </label>
        </div>

        <footer>
          <button type="button" className="button ghost" onClick={onClose}>
            Cancelar
          </button>
          <button className="button primary">Salvar sessão</button>
        </footer>
      </form>
    </div>
  );
}
