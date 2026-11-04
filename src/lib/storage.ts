import type {
  Session,
  SessionType,
  ShootingType,
  TrainingType,
} from '../types/session';

const KEY = 'basketstats.sessions.v2';
const OLD_KEY = 'basketstats.sessions.v1';

const CSV_HEADERS = [
  'id', 'type', 'trainingType', 'shootingType', 'title', 'date',
  'location', 'points', 'assists', 'rebounds', 'steals', 'blocks',
  'fgMade', 'fgAttempted', 'threeMade', 'threeAttempted',
  'ftMade', 'ftAttempted', 'notes',
] as const;

function normalizeSession(value: Partial<Session>): Session {
  const type: SessionType = value.type === 'game' ? 'game' : 'training';
  const shootingType: ShootingType | null =
    value.shootingType === 'FT' || value.shootingType === '3PT'
      ? value.shootingType
      : null;
  const trainingType: TrainingType =
    type === 'training' && value.trainingType === 'shooting'
      ? 'shooting'
      : 'free';

  const number = (candidate: unknown) => {
    const parsed = Number(candidate);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  };

  return {
    id: value.id || crypto.randomUUID(),
    type,
    trainingType,
    shootingType: trainingType === 'shooting' ? shootingType : null,
    title: String(value.title || 'Sessão importada'),
    date: String(value.date || new Date().toISOString().slice(0, 10)),
    location: String(value.location || ''),
    points: number(value.points),
    assists: number(value.assists),
    rebounds: number(value.rebounds),
    steals: number(value.steals),
    blocks: number(value.blocks),
    fgMade: number(value.fgMade),
    fgAttempted: number(value.fgAttempted),
    threeMade: number(value.threeMade),
    threeAttempted: number(value.threeAttempted),
    ftMade: number(value.ftMade),
    ftAttempted: number(value.ftAttempted),
    notes: String(value.notes || ''),
  };
}

export function readSessions(): Session[] {
  try {
    const current = localStorage.getItem(KEY);
    const old = localStorage.getItem(OLD_KEY);
    const parsed = JSON.parse(current ?? old ?? '[]');
    const sessions = Array.isArray(parsed)
      ? parsed.map((item) => normalizeSession(item))
      : [];

    if (!current && old) {
      writeSessions(sessions);
    }

    return sessions;
  } catch {
    return [];
  }
}

export function writeSessions(items: Session[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function escapeCsv(value: string | number | null): string {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text)
    ? `"${text.replace(/"/g, '""')}"`
    : text;
}

export function downloadBackup(items: Session[]) {
  const rows = items.map((session) =>
    CSV_HEADERS.map((header) => escapeCsv(session[header])).join(','),
  );
  const csv = [CSV_HEADERS.join(','), ...rows].join('\r\n');
  const blob = new Blob(['\uFEFF', csv], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `basketstats-backup-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (character === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(field);
      field = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1;
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }

  row.push(field);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

export async function importBackup(file: File): Promise<Session[]> {
  const rows = parseCsv((await file.text()).replace(/^\uFEFF/, ''));

  if (rows.length < 2) {
    throw new Error('O arquivo não contém sessões para importar.');
  }

  const headers = rows[0];
  const required = ['type', 'title', 'date'];
  const missing = required.filter((header) => !headers.includes(header));

  if (missing.length) {
    throw new Error(`Colunas obrigatórias ausentes: ${missing.join(', ')}.`);
  }

  const indexOf = (name: string) => headers.indexOf(name);
  const getValue = (row: string[], name: string) => {
    const index = indexOf(name);
    return index >= 0 ? row[index] ?? '' : '';
  };

  return rows.slice(1).map((row, index) => {
    const type = getValue(row, 'type');
    if (type !== 'training' && type !== 'game') {
      throw new Error(`Tipo inválido na linha ${index + 2}.`);
    }

    const raw: Partial<Session> = {
      id: getValue(row, 'id'),
      type,
      trainingType: getValue(row, 'trainingType') as TrainingType,
      shootingType: getValue(row, 'shootingType') as ShootingType,
      title: getValue(row, 'title'),
      date: getValue(row, 'date'),
      location: getValue(row, 'location'),
      points: Number(getValue(row, 'points')),
      assists: Number(getValue(row, 'assists')),
      rebounds: Number(getValue(row, 'rebounds')),
      steals: Number(getValue(row, 'steals')),
      blocks: Number(getValue(row, 'blocks')),
      fgMade: Number(getValue(row, 'fgMade')),
      fgAttempted: Number(getValue(row, 'fgAttempted')),
      threeMade: Number(getValue(row, 'threeMade')),
      threeAttempted: Number(getValue(row, 'threeAttempted')),
      ftMade: Number(getValue(row, 'ftMade')),
      ftAttempted: Number(getValue(row, 'ftAttempted')),
      notes: getValue(row, 'notes'),
    };

    return normalizeSession(raw);
  });
}
