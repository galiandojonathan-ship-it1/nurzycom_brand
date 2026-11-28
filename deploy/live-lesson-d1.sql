PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS live_rounds (
  id TEXT PRIMARY KEY,
  host_token_hash TEXT NOT NULL,
  title TEXT NOT NULL,
  set_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  starts_at INTEGER,
  closed_at INTEGER,
  expires_at INTEGER NOT NULL,
  seconds_per_question INTEGER NOT NULL DEFAULT 45 CHECK (seconds_per_question = 45)
);

CREATE TABLE IF NOT EXISTS live_questions (
  round_id TEXT NOT NULL REFERENCES live_rounds(id) ON DELETE CASCADE,
  number INTEGER NOT NULL CHECK (number BETWEEN 1 AND 10),
  grading_json TEXT NOT NULL,
  PRIMARY KEY (round_id, number)
);

CREATE TABLE IF NOT EXISTS live_participants (
  round_id TEXT NOT NULL REFERENCES live_rounds(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  joined_at INTEGER NOT NULL,
  PRIMARY KEY (round_id, id)
);

CREATE TABLE IF NOT EXISTS live_answers (
  round_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  question_number INTEGER NOT NULL,
  answer TEXT NOT NULL,
  correct INTEGER NOT NULL CHECK (correct IN (0, 1)),
  submitted_at INTEGER NOT NULL,
  PRIMARY KEY (round_id, participant_id, question_number),
  FOREIGN KEY (round_id, participant_id) REFERENCES live_participants(round_id, id) ON DELETE CASCADE,
  FOREIGN KEY (round_id, question_number) REFERENCES live_questions(round_id, number) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS live_rounds_expires_at ON live_rounds(expires_at);

-- Version 2 tables support configurable rounds. The live API also creates these on first use.
CREATE TABLE IF NOT EXISTS live_round_items (
  round_id TEXT NOT NULL REFERENCES live_rounds(id) ON DELETE CASCADE,
  number INTEGER NOT NULL CHECK (number BETWEEN 1 AND 100),
  grading_json TEXT NOT NULL,
  PRIMARY KEY (round_id, number)
);

CREATE TABLE IF NOT EXISTS live_round_responses (
  round_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  question_number INTEGER NOT NULL,
  answer TEXT NOT NULL,
  correct INTEGER NOT NULL CHECK (correct IN (0, 1)),
  submitted_at INTEGER NOT NULL,
  PRIMARY KEY (round_id, participant_id, question_number),
  FOREIGN KEY (round_id, participant_id) REFERENCES live_participants(round_id, id) ON DELETE CASCADE,
  FOREIGN KEY (round_id, question_number) REFERENCES live_round_items(round_id, number) ON DELETE CASCADE
);
