export type SessionType = 'training' | 'game';
export type TrainingType = 'free' | 'shooting';
export type ShootingType = 'FT' | '3PT';

export interface Session {
  id: string;
  createdAt: string;
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

export type SessionDraft = Omit<Session, 'id' | 'createdAt'>;
export type ViewType = 'free' | 'ft' | 'three' | 'game';

export interface BasketStatsBackup {
  format: 'basketstats-backup';
  version: 3;
  exportedAt: string;
  sessions: Session[];
}

export interface ImportSummary {
  total: number;
  free: number;
  ft: number;
  three: number;
  games: number;
}

export interface ImportResult {
  sessions: Session[];
  summary: ImportSummary;
}
