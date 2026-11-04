import type { Session, SessionType } from '../types/session';

const KEY = 'basketstats.sessions.v1';

const CSV_HEADERS = [
  'id',
  'type',
  'title',
  'date',
  'points',
  'assists',
  'rebounds',
  'steals',
  'fgMade',
  'fgAttempted',
  'threeMade',
  'threeAttempted',
  'ftMade',
  'ftAttempted',
  'notes',
] as const;

export function readSessions(): Session[] {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function writeSessions(items: Session[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function escapeCsv(value: string | number): string {
  const text = String(value ?? '');

  if (
    text.includes(',') ||
    text.includes('"') ||
    text.includes('\n') ||
    text.includes('\r')
  ) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
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
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"' && insideQuotes && nextCharacter === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      insideQuotes = !insideQuotes;
    } else if (character === ',' && !insideQuotes) {
      row.push(field);
      field = '';
    } else if (
      (character === '\n' || character === '\r') &&
      !insideQuotes
    ) {
      if (character === '\r' && nextCharacter === '\n') {
        index += 1;
      }

      row.push(field);

      if (row.some((value) => value.trim() !== '')) {
        rows.push(row);
      }

      row = [];
      field = '';
    } else {
      field += character;
    }
  }

  row.push(field);

  if (row.some((value) => value.trim() !== '')) {
    rows.push(row);
  }

  return rows;
}

function toNumber(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function isSessionType(value: string | undefined): value is SessionType {
  return value === 'training' || value === 'game';
}

export async function importBackup(file: File): Promise<Session[]> {
  const text = (await file.text()).replace(/^\uFEFF/, '');
  const rows = parseCsv(text);

  if (rows.length < 2) {
    throw new Error('O arquivo não contém sessões para importar.');
  }

  const headers = rows[0];
  const indexOf = (name: string) => headers.indexOf(name);

  const missingHeaders = CSV_HEADERS.filter(
    (header) => indexOf(header) === -1,
  );

  if (missingHeaders.length > 0) {
    throw new Error(
      `Arquivo inválido. Colunas ausentes: ${missingHeaders.join(', ')}.`,
    );
  }

  const sessions = rows.slice(1).map((row, rowIndex): Session => {
    const get = (name: string) => row[indexOf(name)] ?? '';
    const type = get('type');

    if (!isSessionType(type)) {
      throw new Error(
        `Tipo inválido na linha ${rowIndex + 2}. Use training ou game.`,
      );
    }

    const title = get('title').trim();
    const date = get('date').trim();

    if (!title || !date) {
      throw new Error(
        `Nome ou data ausente na linha ${rowIndex + 2}.`,
      );
    }

    return {
      id: get('id').trim() || crypto.randomUUID(),
      type,
      title,
      date,
      points: toNumber(get('points')),
      assists: toNumber(get('assists')),
      rebounds: toNumber(get('rebounds')),
      steals: toNumber(get('steals')),
      fgMade: toNumber(get('fgMade')),
      fgAttempted: toNumber(get('fgAttempted')),
      threeMade: toNumber(get('threeMade')),
      threeAttempted: toNumber(get('threeAttempted')),
      ftMade: toNumber(get('ftMade')),
      ftAttempted: toNumber(get('ftAttempted')),
      notes: get('notes'),
    };
  });

  return sessions;
}
