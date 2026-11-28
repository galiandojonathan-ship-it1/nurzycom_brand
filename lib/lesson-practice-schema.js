export const practiceTables = [
  `CREATE TABLE IF NOT EXISTS lp_rooms (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, current INTEGER, closed_at INTEGER, expires_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS lp_rooms_expires ON lp_rooms(expires_at)`,
  `CREATE TABLE IF NOT EXISTS lp_members (
    room TEXT NOT NULL REFERENCES lp_rooms(id) ON DELETE CASCADE, account TEXT NOT NULL, token_hash TEXT NOT NULL,
    joined_at INTEGER NOT NULL, report TEXT, PRIMARY KEY(room, account)
  )`,
  `CREATE TABLE IF NOT EXISTS lp_questions (
    room TEXT NOT NULL REFERENCES lp_rooms(id) ON DELETE CASCADE, number INTEGER NOT NULL, ref TEXT NOT NULL,
    snapshot TEXT NOT NULL, kind TEXT NOT NULL, accepted TEXT NOT NULL, skill TEXT NOT NULL,
    PRIMARY KEY(room, number), UNIQUE(room, ref)
  )`,
  `CREATE TABLE IF NOT EXISTS lp_attempts (
    room TEXT NOT NULL, account TEXT NOT NULL, number INTEGER NOT NULL, opened_at INTEGER NOT NULL,
    hints INTEGER NOT NULL DEFAULT 0, answer TEXT, correct INTEGER, submitted_at INTEGER,
    PRIMARY KEY(room, account, number),
    FOREIGN KEY(room, account) REFERENCES lp_members(room, account) ON DELETE CASCADE,
    FOREIGN KEY(room, number) REFERENCES lp_questions(room, number) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS lp_attempts_question ON lp_attempts(room, number)`,
  `CREATE TABLE IF NOT EXISTS lp_profiles (
    account TEXT PRIMARY KEY, hints INTEGER NOT NULL, note TEXT NOT NULL
  )`
];
