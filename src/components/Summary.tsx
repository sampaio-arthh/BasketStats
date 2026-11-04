import type { Session } from '../types/session';
import { aggregate, percentage } from '../lib/stats';
import { Stat } from './Stat';

export function Summary({ items }: { items: Session[] }) {
  const stats = aggregate(items);
  const onlyShooting = items.length > 0 && items.every(
    (item) => item.trainingType === 'shooting',
  );

  const shootingMade = items.reduce((total, item) => {
    return total + (
      item.shootingType === 'FT'
        ? item.ftMade
        : item.threeMade
    );
  }, 0);

  const shootingAttempted = items.reduce((total, item) => {
    return total + (
      item.shootingType === 'FT'
        ? item.ftAttempted
        : item.threeAttempted
    );
  }, 0);

  const shootingMissed = Math.max(
    0,
    shootingAttempted - shootingMade,
  );

  const bestSessionPercentage = items.reduce(
    (best, item) => {
      const made = item.shootingType === 'FT'
        ? item.ftMade
        : item.threeMade;
      const attempted = item.shootingType === 'FT'
        ? item.ftAttempted
        : item.threeAttempted;

      return Math.max(
        best,
        percentage(made, attempted),
      );
    },
    0,
  );

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

      {onlyShooting ? (
        <div className="stats-grid stats-grid--shooting">
          <Stat
            label="ACERTOS"
            value={shootingMade}
          />

          <Stat
            label="ERROS"
            value={shootingMissed}
          />

          <Stat
            label="MÉDIA GERAL %"
            value={percentage(
              shootingMade,
              shootingAttempted,
            )}
            accent
          />

          <Stat
            label="MELHOR SESSÃO %"
            value={bestSessionPercentage}
            accent
          />
        </div>
      ) : (
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
      )}
    </section>
  );
}
