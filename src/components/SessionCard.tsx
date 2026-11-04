import { CalendarDays, MapPin, Trash2 } from 'lucide-react';
import { format, percentage, trueShooting } from '../lib/stats';
import type { Session } from '../types/session';
import { Stat } from './Stat';

export function SessionCard({
  session,
  onDelete,
}: {
  session: Session;
  onDelete: (id: string) => void;
}) {
  const isShooting = session.trainingType === 'shooting';
  const made = session.shootingType === 'FT'
    ? session.ftMade
    : session.threeMade;
  const attempted = session.shootingType === 'FT'
    ? session.ftAttempted
    : session.threeAttempted;

  return (
    <article className="session-card">
      <header>
        <div>
          <h3>{session.title}</h3>
          <p>
            <CalendarDays size={15} />
            {new Date(`${session.date}T12:00:00`).toLocaleDateString('pt-BR')}
          </p>
          {session.type === 'game' && session.location && (
            <p><MapPin size={15} />{session.location}</p>
          )}
        </div>

        <button
          type="button"
          className="icon-button danger"
          onClick={() => onDelete(session.id)}
          aria-label={`Excluir ${session.title}`}
        >
          <Trash2 size={18} />
        </button>
      </header>

      {isShooting ? (
        <div className="shot-result">
          <strong>{made}/{attempted}</strong>
          <span>{session.shootingType} · {format(percentage(made, attempted))}%</span>
        </div>
      ) : (
        <>
          <div className="session-stats session-stats--five">
            <Stat label="PTS" value={session.points} />
            <Stat label="AST" value={session.assists} />
            <Stat label="REB" value={session.rebounds} />
            <Stat label="STL" value={session.steals} />
            <Stat label="BLK" value={session.blocks} />
          </div>
          <div className="shooting">
            <span>FG <b>{session.fgMade}/{session.fgAttempted}</b> · {format(percentage(session.fgMade, session.fgAttempted))}%</span>
            <span>3PT <b>{session.threeMade}/{session.threeAttempted}</b> · {format(percentage(session.threeMade, session.threeAttempted))}%</span>
            <span>TS <b>{format(trueShooting(session.points, session.fgAttempted, session.ftAttempted))}%</b></span>
          </div>
        </>
      )}

      {session.notes && <p className="notes">{session.notes}</p>}
    </article>
  );
}
