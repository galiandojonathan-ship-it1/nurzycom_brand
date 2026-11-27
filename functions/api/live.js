// Live rounds use D1 so the host sees committed answers on the next poll.
const headers = { "content-type": "application/json", "cache-control": "no-store" };
const reply = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });
const error = (status, message) => reply({ error: message }, status);
const token = () => crypto.randomUUID().replaceAll("-", "");
const validToken = (value) => /^[a-f0-9]{32}$/.test(value || "");
const hash = async (value) => Array.from(new Uint8Array(await crypto.subtle.digest(
  "SHA-256", new TextEncoder().encode(value)
)), (byte) => byte.toString(16).padStart(2, "0")).join("");

function numeric(raw) {
  const s = String(raw).normalize("NFKC").trim().replace(/[−–—]/g, "-").replace(/[⁄∕]/g, "/");
  let num, den;
  if (/^[+-]?\s*\d+\s*\/\s*[+-]?\s*\d+$/.test(s)) {
    const [a, b] = s.replace(/\s/g, "").split("/");
    num = BigInt(a); den = BigInt(b);
  } else if (/^[+-]?\s*(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(s)) {
    const neg = s.startsWith("-");
    const [i, f = ""] = s.replace(/^[+-]?\s*/, "").split(/[.,]/);
    den = 10n ** BigInt(f.length); num = BigInt((i || "0") + f) * (neg ? -1n : 1n);
  } else return null;
  if (den === 0n) return null;
  const sign = (num < 0n) !== (den < 0n) ? -1n : 1n;
  const an = num < 0n ? -num : num, ad = den < 0n ? -den : den;
  let q = (an * 10000n) / ad; const r = (an * 10000n) % ad;
  if (2n * r >= ad) q += 1n;
  if (q === 0n) return "0.0000";
  const str = q.toString().padStart(5, "0");
  return (sign < 0n ? "-" : "") + str.slice(0, -4) + "." + str.slice(-4);
}

// A display key can include a parenthetical note after its numeric value.
const numericKey = (answer) => numeric(answer.replace(/\s*\([^()]*\)\s*$/, ""));
// What a student types: «x = 655», «≈ 1.5» and spaces still count as the number.
const typedValue = (value) => String(value).normalize("NFKC").replace(/^\s*[a-zа-я]\s*=\s*/i, "").replace(/^\s*[≈~]\s*/, "").trim();

function num(s) {
  const t = String(s).normalize("NFKC").trim().replace(/\s+/g, "").replace(/,/g, ".").replace(/^\+/, "")
    .replace(/[−–—]/g, "-").replace(/[⁄∕]/g, "/");
  if (/^-?\d*\.?\d+$/.test(t)) return Number(t);
  const m = /^(-?\d*\.?\d+)\/(-?\d*\.?\d+)$/.exec(t); if (m && Number(m[2]) !== 0) return Number(m[1]) / Number(m[2]);
  return null;
}
// Teacher-created tests use the same tolerant numeric/text comparison as ctlogic.js.
function customRight(answer, value) {
  const expected = num(answer), actual = num(value);
  if (expected !== null && actual !== null) {
    return Math.abs(expected - actual) < 1e-9 * Math.max(1, Math.abs(expected));
  }
  const clean = (text) => String(text).trim().toLowerCase().replace(/\s+/g, "");
  return clean(answer) === clean(value);
}

export function isCorrect(key, value) {
  if (typeof key === "string") return key === value; // Rounds created before sealed snapshots.
  if (key.type === "mc") return key.accepted.includes(value);
  if (key.type === "custom") return key.accepted.some((answer) => customRight(answer, value));
  // A typed key without any number (for example «2√3») is compared as text, like the teacher's own tests.
  const numbers = key.accepted.map(numericKey).filter((answer) => answer !== null);
  if (!numbers.length) return key.accepted.some((answer) => customRight(answer, value));
  const actual = numeric(typedValue(value));
  return actual !== null && numbers.includes(actual);
}

export async function onRequest({ env, request }) {
  const db = env.LIVE_LESSONS;
  if (!db) return error(503, "Хранилище живых занятий ещё не подключено.");
  const url = new URL(request.url);
  const id = url.searchParams.get("round");
  const now = Date.now();
  const action = url.searchParams.get("action") || "state";
  const method = request.method;
  // Setup check (no data): are the four tables of deploy/live-lesson-d1.sql in the database?
  if (action === "health" && method === "GET") {
    const need = ["live_rounds", "live_questions", "live_participants", "live_answers"];
    const have = (await db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE 'live_%'").all()).results.map((row) => row.name);
    const missing = need.filter((name) => !have.includes(name));
    return reply({ ok: !missing.length, missing });
  }
  if (method !== (action === "state" ? "GET" : "POST")) return error(405, "Метод недоступен.");
  if (request.headers.get("origin") && request.headers.get("origin") !== url.origin) return error(403, "Доступ закрыт.");
  let data = {};
  if (method === "POST") {
    const raw = await request.text();
    if (raw.length > 700000) return error(413, "Слишком большой запрос.");
    try { data = JSON.parse(raw); } catch { return error(400, "Неверный запрос."); }
    if (!data || typeof data !== "object") return error(400, "Неверный запрос.");
  }

  if (action === "create") {
    const key = request.headers.get("x-admin-key");
    const adminHash = key && env.USERS && await env.USERS.get("admin");
    if (!adminHash || await hash("bynurzy-admin:" + key) !== adminHash) return error(403, "Откройте кабинет преподавателя в этом браузере.");
    const { set, title, keys, settings } = data;
    const configured = settings !== undefined;
    if (configured && (!settings || !Number.isInteger(settings.seconds) ||
        settings.seconds < 5 || settings.seconds > 600 || typeof settings.strict !== "boolean" ||
        ["selfPaced", "calculator"].some((flag) => settings[flag] !== undefined && typeof settings[flag] !== "boolean") ||
        settings.strict && settings.selfPaced)) {
      return error(400, "Время на вопрос: от 5 до 600 секунд.");
    }
    if (configured && settings.record !== undefined &&
        (typeof settings.record !== "string" || settings.record.length > 24576 || !/^[A-Za-z0-9+/=]+$/.test(settings.record))) {
      return error(400, "Настройки учёта в индексе недоступны.");
    }
    const maximum = configured ? 100 : 10;
    if (!(typeof set === "string" && (/^X\d{2}$/.test(set) || /^sealed:[A-Za-z0-9+/=]+$/.test(set) && set.length <= 650000)) || typeof title !== "string" || title.length > 160 ||
        !Array.isArray(keys) || keys.length < 1 || keys.length > maximum || keys.some((key) =>
          typeof key === "string" ? !/^[A-D]$/.test(key) :
          !key || !["mc", "spr", "custom"].includes(key.type) || !Array.isArray(key.accepted) ||
          !key.accepted.length || key.accepted.length > 20 ||
          key.accepted.some((answer) => typeof answer !== "string" || answer.length > 64))) {
      return error(400, "Выберите от 1 до 100 вопросов.");
    }
    if (keys.some((key) => key.type === "spr" && !key.accepted.some((answer) => numericKey(answer) !== null))) {
      return error(400, "У одного из вопросов отсутствует числовой ключ.");
    }
    const round = token(), host = token();
    if (configured) {
      // Separate versioned tables preserve every existing round and its ten-question constraint.
      await db.batch([
        db.prepare(`CREATE TABLE IF NOT EXISTS live_round_items (
          round_id TEXT NOT NULL REFERENCES live_rounds(id) ON DELETE CASCADE,
          number INTEGER NOT NULL CHECK(number BETWEEN 1 AND 100),
          grading_json TEXT NOT NULL,
          PRIMARY KEY (round_id, number))`).bind(),
        db.prepare(`CREATE TABLE IF NOT EXISTS live_round_responses (
          round_id TEXT NOT NULL,
          participant_id TEXT NOT NULL,
          question_number INTEGER NOT NULL,
          answer TEXT NOT NULL,
          correct INTEGER NOT NULL CHECK(correct IN (0,1)),
          submitted_at INTEGER NOT NULL,
          PRIMARY KEY (round_id, participant_id, question_number),
          FOREIGN KEY (round_id, participant_id) REFERENCES live_participants(round_id, id) ON DELETE CASCADE,
          FOREIGN KEY (round_id, question_number) REFERENCES live_round_items(round_id, number) ON DELETE CASCADE)`).bind()
      ]);
    }
    const questionTable = configured ? "live_round_items" : "live_questions";
    const storedSet = configured ? JSON.stringify({
      v: settings.selfPaced !== undefined || settings.calculator !== undefined ? 3 : 2,
      source: set, seconds: settings.seconds, strict: settings.strict, selfPaced: settings.selfPaced,
      calculator: settings.calculator, record: settings.record, current: 1, questionStartedAt: null
    }) : set;
    // Keep D1 bind counts and per-invocation query counts small on the Free plan.
    const questionInserts = [];
    for (let start = 0; start < keys.length; start += 30) {
      const group = keys.slice(start, start + 30);
      const rows = group.map(() => "(?, ?, ?)").join(", ");
      const values = group.flatMap((key, index) => [round, start + index + 1, JSON.stringify(key)]);
      questionInserts.push(db.prepare(`INSERT INTO ${questionTable} VALUES ${rows}`).bind(...values));
    }
    await db.batch([
      db.prepare("DELETE FROM live_rounds WHERE expires_at <= ?").bind(now),
      db.prepare("INSERT INTO live_rounds (id, host_token_hash, title, set_id, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(round, await hash(host), title, storedSet, now, now + 86400000),
      ...questionInserts
    ]);
    return reply({ round, host }, 201);
  }

  if (!validToken(id)) return error(404, "Раунд не найден.");
  const round = await db.prepare("SELECT * FROM live_rounds WHERE id = ? AND expires_at > ?").bind(id, now).first();
  if (!round) return error(404, "Раунд не найден или истёк.");
  const config = round.set_id.startsWith("{") ? JSON.parse(round.set_id) : null;
  const questionTable = config ? "live_round_items" : "live_questions";
  const answerTable = config ? "live_round_responses" : "live_answers";
  const seconds = config?.seconds || 45;
  const strict = config?.strict !== false;
  const editable = config?.v === 3;
  const selfPaced = editable && config.selfPaced === true;
  const secret = request.headers.get("x-live-token");
  const authenticated = validToken(secret) ? await hash(secret) : null;
  const host = authenticated === round.host_token_hash;
  const started = round.starts_at;
  const { total } = await db.prepare(`SELECT count(*) AS total FROM ${questionTable} WHERE round_id = ?`).bind(id).first();
  const end = !strict || started === null ? null : started + total * seconds * 1000;
  const finished = round.closed_at !== null || (end !== null && now >= end);

  if (action === "start" && host) {
    await db.prepare("UPDATE live_rounds SET starts_at = ? WHERE id = ? AND starts_at IS NULL AND closed_at IS NULL")
      .bind(now + 3000, id).run();
    return reply({ ok: true });
  }
  if ((action === "next" || action === "previous") && host) {
    if (strict || started === null || now < started || finished || data.number !== config.current) {
      return error(409, "Обновите состояние раунда.");
    }
    const target = config.current + (action === "previous" ? -1 : 1);
    if (target < 1 || target > total && selfPaced) return error(409, "Вопрос недоступен.");
    let update;
    if (target > total) {
      update = db.prepare("UPDATE live_rounds SET closed_at = ? WHERE id = ? AND set_id = ? AND closed_at IS NULL")
        .bind(now, id, round.set_id);
    } else {
      const next = JSON.stringify({ ...config, current: target, questionStartedAt: now });
      update = db.prepare("UPDATE live_rounds SET set_id = ? WHERE id = ? AND set_id = ? AND closed_at IS NULL")
        .bind(next, id, round.set_id);
    }
    const result = await update.run();
    return result.meta.changes ? reply({ ok: true }) : error(409, "Вопрос уже изменился. Обновите раунд.");
  }
  // jump to any question in a teacher-led round without the strict clock (Nurassyl, 2026-11-23: «быстро списком перемещаться по
  // вопросам при нестрогом раунде»)
  if (action === "goto" && host) {
    if (strict || selfPaced || started === null || now < started || finished || data.number !== config.current) return error(409, "Обновите состояние раунда.");
    if (!Number.isInteger(data.target) || data.target < 1 || data.target > total) return error(409, "Вопрос недоступен.");
    const next = JSON.stringify({ ...config, current: data.target, questionStartedAt: now });
    const result = await db.prepare("UPDATE live_rounds SET set_id = ? WHERE id = ? AND set_id = ? AND closed_at IS NULL").bind(next, id, round.set_id).run();
    return result.meta.changes ? reply({ ok: true }) : error(409, "Вопрос уже изменился. Обновите раунд.");
  }
  // remove a participant (2026-11-23: «иногда заходят с другого девайса и их двое становится»): the row and its answers go;
  // that device can no longer answer and sees «Доступ закрыт»
  if (action === "remove" && host) {
    if (!validToken(data.participant)) return error(400, "Неверный участник.");
    await db.batch([
      db.prepare(`DELETE FROM ${answerTable} WHERE round_id = ? AND participant_id = ?`).bind(id, data.participant),
      db.prepare("DELETE FROM live_participants WHERE round_id = ? AND id = ?").bind(id, data.participant)
    ]);
    return reply({ ok: true });
  }
  if (action === "close" && host) {
    await db.prepare("UPDATE live_rounds SET closed_at = ? WHERE id = ? AND closed_at IS NULL").bind(now, id).run();
    return reply({ ok: true });
  }
  if (action === "join") {
    if (finished) return error(409, "Раунд уже завершён.");
    const name = typeof data.name === "string" && data.name.trim().slice(0, 60);
    if (!name) return error(400, "Введите имя.");
    const participant = token(), student = token();
    const insert = await db.prepare(`INSERT INTO live_participants
      SELECT id, ?, ?, ?, ? FROM live_rounds WHERE id = ? AND closed_at IS NULL AND expires_at > ?
      AND (starts_at IS NULL OR ? = 0 OR ? < starts_at + ?)
      AND (SELECT count(*) FROM live_participants WHERE round_id = ?) < 100`)
      .bind(participant, name, await hash(student), now, id, now, strict ? 1 : 0, now, total * seconds * 1000, id).run();
    return insert.meta.changes ? reply({ participant, student }, 201) : error(409, "Вход в раунд закрыт.");
  }

  const participant = !host && authenticated && validToken(url.searchParams.get("student"))
    ? await db.prepare("SELECT id FROM live_participants WHERE round_id = ? AND id = ? AND token_hash = ?")
      .bind(id, url.searchParams.get("student"), authenticated).first()
    : null;

  if (action === "answer" && participant) {
    if (!Number.isInteger(data.number) || data.number < 1 || data.number > total || typeof data.answer !== "string" || !data.answer.trim() || data.answer.length > 64) return error(400, "Неверный ответ.");
    const question = await db.prepare(`SELECT grading_json FROM ${questionTable} WHERE round_id = ? AND number = ?`).bind(id, data.number).first();
    if (!question) return error(404, "Вопрос недоступен.");
    const grading = JSON.parse(question.grading_json);
    if ((typeof grading === "string" || grading.type === "mc") && !/^[A-D]$/.test(data.answer)) {
      return error(400, "Выберите вариант ответа.");
    }
    // A typed answer is always stored, even when it is not a number, so the teacher sees exactly what the student wrote.
    const correct = isCorrect(grading, data.answer);
    const timing = strict
      ? "AND ? >= r.starts_at + (q.number - 1) * ? AND ? < r.starts_at + q.number * ?"
      : selfPaced ? "AND ? >= r.starts_at" : "AND ? >= r.starts_at AND q.number = json_extract(r.set_id, '$.current')";
    const timingArgs = strict ? [now, seconds * 1000, now, seconds * 1000] : [now];
    const conflict = editable ? `(round_id, participant_id, question_number) DO UPDATE SET
      answer = excluded.answer, correct = excluded.correct, submitted_at = excluded.submitted_at
      WHERE excluded.submitted_at >= ${answerTable}.submitted_at` : "DO NOTHING";
    const insert = await db.prepare(`INSERT INTO ${answerTable}
      SELECT q.round_id, ?, q.number, ?, ?, ?
      FROM ${questionTable} q JOIN live_rounds r ON r.id = q.round_id
      WHERE q.round_id = ? AND q.number = ? AND r.closed_at IS NULL
      ${timing}
      ON CONFLICT ${conflict}`)
      .bind(participant.id, data.answer, correct ? 1 : 0, now, id, data.number, ...timingArgs).run();
    return insert.meta.changes ? reply({ ok: true }) : error(409, editable ? "Время вышло или преподаватель переключил вопрос." : "Ответ уже принят или время вышло.");
  }

  if (action === "state" && (host || participant)) {
    const state = {
      title: round.title,
      set: url.searchParams.get("snapshot") === "0" ? undefined : (config?.source || round.set_id),
      total, started, now, finished, seconds, strict, editable, selfPaced, calculator: config?.calculator === true,
      current: config?.current || 1,
      questionStartedAt: config?.questionStartedAt || started
    };
    if (host) {
      if (config?.record) state.record = config.record;
      const [students, answers] = await db.batch([
        db.prepare("SELECT id, display_name FROM live_participants WHERE round_id = ? ORDER BY joined_at").bind(id),
        db.prepare(`SELECT participant_id, question_number, answer, correct FROM ${answerTable} WHERE round_id = ?`).bind(id)
      ]);
      state.students = students.results;
      state.answers = answers.results;
      if (finished) {
        const keys = await db.prepare(`SELECT grading_json FROM ${questionTable} WHERE round_id = ? ORDER BY number`).bind(id).all();
        state.keys = keys.results.map(({ grading_json }) => JSON.parse(grading_json));
      }
    } else if (participant) {
      const answers = await db.prepare(`SELECT question_number, answer FROM ${answerTable} WHERE round_id = ? AND participant_id = ?`)
        .bind(id, participant.id).all();
      state.answers = answers.results;
    }
    return reply(state);
  }
  return error(403, "Доступ закрыт.");
}
