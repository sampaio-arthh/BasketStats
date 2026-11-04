import { useState } from 'react';
import { Check, RotateCcw, X, XCircle } from 'lucide-react';
import { percentage } from '../lib/stats';
import type { SessionDraft, ShootingType } from '../types/session';
import { emptySession } from '../features/sessions/defaults';

export function ShotCounter({
  open,
  shootingType,
  onClose,
  onSave,
}: {
  open: boolean;
  shootingType: ShootingType;
  onClose: () => void;
  onSave: (draft: SessionDraft) => void;
}) {
  const [made, setMade] = useState(0);
  const [attempted, setAttempted] = useState(0);

  if (!open) return null;

  const reset = () => {
    setMade(0);
    setAttempted(0);
  };

  const close = () => {
    reset();
    onClose();
  };

  const save = () => {
    if (attempted === 0) return;
    const view = shootingType === 'FT' ? 'ft' : 'three';
    const draft = emptySession(view);

    if (shootingType === 'FT') {
      draft.ftMade = made;
      draft.ftAttempted = attempted;
    } else {
      draft.threeMade = made;
      draft.threeAttempted = attempted;
    }

    draft.title = `Contador ${shootingType} · ${made}/${attempted}`;
    onSave(draft);
    close();
  };

  return (
    <div className="modal-backdrop">
      <section className="shot-counter" aria-label={`Contador de ${shootingType}`}>
        <header>
          <div>
            <span>CONTADOR DE ARREMESSOS</span>
            <h2>{shootingType}</h2>
          </div>
          <button type="button" className="icon-button" onClick={close}>
            <X />
          </button>
        </header>

        <div className="counter-result">
          <strong>{made}/{attempted}</strong>
          <span>{percentage(made, attempted).toFixed(1)}% de aproveitamento</span>
        </div>

        <div className="counter-actions">
          <button type="button" className="counter-button made" onClick={() => {
            setMade((value) => value + 1);
            setAttempted((value) => value + 1);
          }}>
            <Check /> Acerto
          </button>

          <button type="button" className="counter-button missed" onClick={() => {
            setAttempted((value) => value + 1);
          }}>
            <XCircle /> Erro
          </button>
        </div>

        <footer>
          <button type="button" className="button ghost" onClick={reset}>
            <RotateCcw size={17} /> Zerar
          </button>
          <button type="button" className="button primary" disabled={attempted === 0} onClick={save}>
            Salvar como sessão
          </button>
        </footer>
      </section>
    </div>
  );
}
