import type { Session } from '../types/session';
import { aggregate } from '../lib/stats';
import { Stat } from './Stat';

export function Summary({ items }: { items: Session[] }) {
  const stats = aggregate(items);
  const onlyShooting = items.length > 0 && items.every(
    (item) => item.trainingType === 'shooting',
  );

  return (
    <section className="summary" aria-label="Visão geral das estatísticas">
      <div className="summary__title">
        <h2>VISÃO GERAL</h2>
        <div className="summary__count">{stats.count} sessões</div>
      </div>

      <div className={`stats-grid ${onlyShooting ? 'stats-grid--shooting' : ''}`}>
        {onlyShooting ? (
          <>
            <Stat label="FT%" value={stats.ft} accent />
            <Stat label="3PT%" value={stats.three} accent />
          </>
        ) : (
          <>
            <Stat label="PPG" value={stats.ppg} />
            <Stat label="AST/J" value={stats.apg} />
            <Stat label="REB/J" value={stats.rpg} />
            <Stat label="STL/J" value={stats.spg} />
            <Stat label="BLK/J" value={stats.bpg} />
            <Stat label="FG%" value={stats.fg} accent />
            <Stat label="3PT%" value={stats.three} accent />
            <Stat label="FT%" value={stats.ft} accent />
            <Stat label="TS%" value={stats.ts} accent />
          </>
        )}
      </div>
    </section>
  );
}
