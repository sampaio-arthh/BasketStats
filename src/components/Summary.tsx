import type { Session } from '../types/session';
import { aggregate } from '../lib/stats';
import { Stat } from './Stat';

export function Summary({
  items,
}: {
  items: Session[];
}) {
  const stats = aggregate(items);

  return (
    <section
      className="summary"
      aria-label="Visão geral das estatísticas"
    >
      <div className="summary__title">
        <span>VISÃO GERAL</span>

        <div className="summary__count">
          {stats.count} sessões
        </div>
      </div>

      <div className="stats-grid">
        <Stat
          label="PPG"
          value={stats.ppg}
        />

        <Stat
          label="AST/J"
          value={stats.apg}
        />

        <Stat
          label="REB/J"
          value={stats.rpg}
        />

        <Stat
          label="STL/J"
          value={stats.spg}
        />

        <Stat
          label="FG%"
          value={stats.fg}
          accent
        />

        <Stat
          label="3PT%"
          value={stats.three}
          accent
        />

        <Stat
          label="FT%"
          value={stats.ft}
          accent
        />

        <Stat
          label="TS%"
          value={stats.ts}
          accent
        />
      </div>
    </section>
  );
}
