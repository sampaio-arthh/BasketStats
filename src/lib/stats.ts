import type { Session } from '../types/session';

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
