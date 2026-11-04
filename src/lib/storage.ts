import type {
  BasketStatsBackup,
  ImportResult,
  ImportSummary,
  Session,
  SessionType,
  ShootingType,
  TrainingType,
} from '../types/session';

const KEY = 'basketstats.sessions.v3';
const OLD_KEYS = [
  'basketstats.sessions.v2',
  'basketstats.sessions.v1',
];

function safeNumber(candidate: unknown): number {
  const parsed = Number(candidate);
  return Number.isFinite(parsed)
    ? Math.max(0, parsed)
    : 0;
}

function validDate(candidate: unknown): string {
  const text = String(candidate ?? '');

  return /^\d{4}-\d{2}-\d{2}$/.test(text)
    ? text
    : new Date().toISOString().slice(0, 10);
}

function normalizeSession(value: Partial<Session>): Session {
  const type: SessionType = value.type === 'game'
    ? 'game'
    : 'training';
  const shootingType: ShootingType | null =
    value.shootingType === 'FT' || value.shootingType === '3PT'
      ? value.shootingType
      : null;
  const trainingType: TrainingType =
    type === 'training' &&
    value.trainingType === 'shooting' &&
    shootingType !== null
      ? 'shooting'
      : 'free';
  const date = validDate(value.date);

  return {
    id: String(value.id || crypto.randomUUID()),
    createdAt: String(
      value.createdAt || `${date}T12:00:00.000Z`,
    ),
    type,
    trainingType,
    shootingType: trainingType === 'shooting'
      ? shootingType
      : null,
    title: String(value.title || 'Sessão importada'),
    date,
    location: String(value.location || ''),
    points: safeNumber(value.points),
    assists: safeNumber(value.assists),
    rebounds: safeNumber(value.rebounds),
    steals: safeNumber(value.steals),
    blocks: safeNumber(value.blocks),
    fgMade: safeNumber(value.fgMade),
    fgAttempted: safeNumber(value.fgAttempted),
    threeMade: safeNumber(value.threeMade),
    threeAttempted: safeNumber(value.threeAttempted),
    ftMade: safeNumber(value.ftMade),
    ftAttempted: safeNumber(value.ftAttempted),
    notes: String(value.notes || ''),
  };
}

function validateSession(session: Session, index: number) {
  if (!session.title.trim()) {
    throw new Error(
      `A sessão ${index + 1} não possui nome.`,
    );
  }

  if (session.trainingType === 'shooting') {
    const made = session.shootingType === 'FT'
      ? session.ftMade
      : session.threeMade;
    const attempted = session.shootingType === 'FT'
      ? session.ftAttempted
      : session.threeAttempted;

    if (made > attempted) {
      throw new Error(
        `A sessão “${session.title}” possui mais acertos do que tentativas.`,
      );
    }
  }
}

function summarize(sessions: Session[]): ImportSummary {
  return sessions.reduce<ImportSummary>(
    (summary, session) => {
      summary.total += 1;

      if (session.type === 'game') {
        summary.games += 1;
      } else if (session.trainingType === 'free') {
        summary.free += 1;
      } else if (session.shootingType === 'FT') {
        summary.ft += 1;
      } else if (session.shootingType === '3PT') {
        summary.three += 1;
      }

      return summary;
    },
    {
      total: 0,
      free: 0,
      ft: 0,
      three: 0,
      games: 0,
    },
  );
}

export function readSessions(): Session[] {
  try {
    const current = localStorage.getItem(KEY);
    const legacy = OLD_KEYS
      .map((key) => localStorage.getItem(key))
      .find((value) => value !== null);
    const parsed = JSON.parse(current ?? legacy ?? '[]');
    const source = Array.isArray(parsed)
      ? parsed
      : [];
    const sessions = source.map((item) =>
      normalizeSession(item),
    );

    if (!current && legacy) {
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

export function downloadBackup(items: Session[]) {
  const backup: BasketStatsBackup = {
    format: 'basketstats-backup',
    version: 3,
    exportedAt: new Date().toISOString(),
    sessions: items,
  };
  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    {
      type: 'application/json;charset=utf-8',
    },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `basketstats-backup-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function importBackup(
  file: File,
): Promise<ImportResult> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error(
      'O arquivo não é um JSON válido.',
    );
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('format' in parsed) ||
    parsed.format !== 'basketstats-backup' ||
    !('version' in parsed) ||
    parsed.version !== 3 ||
    !('sessions' in parsed) ||
    !Array.isArray(parsed.sessions)
  ) {
    throw new Error(
      'Backup incompatível. Use um arquivo JSON exportado pela versão atual do BasketStats.',
    );
  }

  const sessions = parsed.sessions.map((item, index) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error(
        `A sessão ${index + 1} possui formato inválido.`,
      );
    }

    const session = normalizeSession(
      item as Partial<Session>,
    );
    validateSession(session, index);
    return session;
  });

  return {
    sessions,
    summary: summarize(sessions),
  };
}

export function mergeSessions(
  current: Session[],
  imported: Session[],
): Session[] {
  const byId = new Map<string, Session>();

  current.forEach((session) => {
    byId.set(session.id, session);
  });

  imported.forEach((session) => {
    byId.set(session.id, session);
  });

  return Array.from(byId.values()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}
