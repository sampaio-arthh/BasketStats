export type SessionType = 'training' | 'game';
export type TrainingType = 'free' | 'shooting';
export type ShootingType = 'FT' | '3PT';

export interface Session {
  id: string;
  type: SessionType;
  trainingType: TrainingType;
  shootingType: ShootingType | null;
  title: string;
  date: string;
  location: string;
  points: number;
  assists: number;
  rebounds: number;
  steals: number;
  blocks: number;
  fgMade: number;
  fgAttempted: number;
  threeMade: number;
  threeAttempted: number;
  ftMade: number;
  ftAttempted: number;
  notes: string;
}

export type SessionDraft = Omit<Session, 'id'>;
export type ViewType = 'free' | 'ft' | 'three' | 'game';
