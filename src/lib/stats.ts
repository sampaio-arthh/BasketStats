import type {
  Session,
  ShootingType,
} from '../types/session';

export const percentage = (made: number, attempted: number) =>
  attempted > 0 ? (made / attempted) * 100 : 0;

export const trueShooting = (
  points: number,
  fieldGoalAttempts: number,
  freeThrowAttempts: number,
) => {
  const denominator = 2 * (
    fieldGoalAttempts + 0.44 * freeThrowAttempts
  );

  return denominator > 0 ? (points / denominator) * 100 : 0;
};

export const format = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);

export function aggregate(items: Session[]) {
  const count = items.length;
  const divisor = count || 1;
  const sum = (key: keyof Session) =>
    items.reduce((total, item) => {
      const value = item[key];
      return total + (typeof value === 'number' ? value : 0);
    }, 0);

  const points = sum('points');
  const fieldGoalAttempts = sum('fgAttempted');
  const freeThrowAttempts = sum('ftAttempted');

  return {
    count,
    ppg: points / divisor,
    apg: sum('assists') / divisor,
    rpg: sum('rebounds') / divisor,
    spg: sum('steals') / divisor,
    bpg: sum('blocks') / divisor,
    fg: percentage(sum('fgMade'), fieldGoalAttempts),
    three: percentage(sum('threeMade'), sum('threeAttempted')),
    ft: percentage(sum('ftMade'), freeThrowAttempts),
    ts: trueShooting(points, fieldGoalAttempts, freeThrowAttempts),
  };
}

function shootingValues(
  session: Session,
  shootingType: ShootingType,
) {
  if (shootingType === 'FT') {
    return {
      made: session.ftMade,
      attempted: session.ftAttempted,
    };
  }

  return {
    made: session.threeMade,
    attempted: session.threeAttempted,
  };
}

export function aggregateShooting(
  items: Session[],
  shootingType: ShootingType,
) {
  const sessions = items.filter(
    (item) =>
      item.type === 'training' &&
      item.trainingType === 'shooting' &&
      item.shootingType === shootingType,
  );

  const totals = sessions.reduce(
    (result, session) => {
      const values = shootingValues(session, shootingType);

      return {
        made: result.made + values.made,
        attempted: result.attempted + values.attempted,
      };
    },
    {
      made: 0,
      attempted: 0,
    },
  );

  const bestSession = sessions.reduce<Session | null>(
    (best, current) => {
      if (!best) {
        return current;
      }

      const currentValues = shootingValues(current, shootingType);
      const bestValues = shootingValues(best, shootingType);
      const currentPercentage = percentage(
        currentValues.made,
        currentValues.attempted,
      );
      const bestPercentage = percentage(
        bestValues.made,
        bestValues.attempted,
      );

      if (currentPercentage !== bestPercentage) {
        return currentPercentage > bestPercentage
          ? current
          : best;
      }

      if (currentValues.attempted !== bestValues.attempted) {
        return currentValues.attempted > bestValues.attempted
          ? current
          : best;
      }

      if (current.date !== best.date) {
        return current.date > best.date
          ? current
          : best;
      }

      return current.createdAt > best.createdAt
        ? current
        : best;
    },
    null,
  );

  const bestValues = bestSession
    ? shootingValues(bestSession, shootingType)
    : { made: 0, attempted: 0 };

  return {
    count: sessions.length,
    made: totals.made,
    attempted: totals.attempted,
    average: percentage(totals.made, totals.attempted),
    bestSession,
    bestMade: bestValues.made,
    bestAttempted: bestValues.attempted,
    bestPercentage: percentage(
      bestValues.made,
      bestValues.attempted,
    ),
  };
}
