import type {
  Session,
  ViewType,
} from '../types/session';
import {
  aggregate,
  aggregateShooting,
} from '../lib/stats';
import { Stat } from './Stat';

export function Summary({
  items,
  view,
}: {
  items: Session[];
  view: ViewType;
}) {
  const isShooting = view === 'ft' || view === 'three';

  if (isShooting) {
    const shooting = aggregateShooting(
      items,
      view === 'ft' ? 'FT' : '3PT',
    );

    return (
      <section
        className="summary"
        aria-label="Visão geral dos treinos de arremesso"
      >
        <div className="summary__title">
          <h2>VISÃO GERAL</h2>

          <div className="summary__count">
            {shooting.count} sessões
          </div>
        </div>

        <div className="stats-grid stats-grid--shooting">
          <Stat
            label="ACERTOS TOTAIS"
            value={shooting.made}
          />

          <Stat
            label="TENTATIVAS TOTAIS"
            value={shooting.attempted}
          />

          <Stat
            label="MÉDIA GERAL %"
            value={shooting.average}
            accent
          />

          <Stat
            label="MELHOR MÉDIA %"
            value={shooting.bestPercentage}
            accent
          />
        </div>

        {shooting.bestSession && (
          <p className="summary__best-session">
            Melhor sessão: {shooting.bestSession.title} ·{' '}
            {shooting.bestMade}/{shooting.bestAttempted}
          </p>
        )}
      </section>
    );
  }

  const stats = aggregate(items);

  return (
    <section
      className="summary"
      aria-label="Visão geral das estatísticas"
    >
      <div className="summary__title">
        <h2>VISÃO GERAL</h2>

        <div className="summary__count">
          {stats.count} sessões
        </div>
      </div>

      <div className="stats-grid">
        <Stat label="PPG" value={stats.ppg} />
        <Stat label="AST/J" value={stats.apg} />
        <Stat label="REB/J" value={stats.rpg} />
        <Stat label="STL/J" value={stats.spg} />
        <Stat label="BLK/J" value={stats.bpg} />
        <Stat label="FG%" value={stats.fg} accent />
        <Stat label="3PT%" value={stats.three} accent />
        <Stat label="FT%" value={stats.ft} accent />
        <Stat label="TS%" value={stats.ts} accent />
      </div>
    </section>
  );
}
