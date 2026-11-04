import type {
  SessionDraft,
  ShootingType,
  ViewType,
} from '../../types/session';

export function emptySession(view: ViewType): SessionDraft {
  const isGame = view === 'game';
  const isShooting = view === 'ft' || view === 'three';
  const shootingType: ShootingType | null =
    view === 'ft' ? 'FT' : view === 'three' ? '3PT' : null;

  return {
    type: isGame ? 'game' : 'training',
    trainingType: isShooting ? 'shooting' : 'free',
    shootingType,
    title: '',
    date: new Date().toISOString().slice(0, 10),
    location: '',
    points: 0,
    assists: 0,
    rebounds: 0,
    steals: 0,
    blocks: 0,
    fgMade: 0,
    fgAttempted: 0,
    threeMade: 0,
    threeAttempted: 0,
    ftMade: 0,
    ftAttempted: 0,
    notes: '',
  };
}
