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
  let s = String(raw).slice(0, 64).trim().replace(/[−–—]/g, "-");
  if (/\s/.test(s)) return null;
  if (/^-?\d*,\d+$/.test(s)) s = s.replace(",", ".");
  let num, den;
  if (/^-?\d+\/\d+$/.test(s)) { const [a, b] = s.split("/"); num = BigInt(a); den = BigInt(b); }
  else if (/^-?(\d+\.?\d*|\.\d+)$/.test(s)) {
    const neg = s.startsWith("-"); const t = neg ? s.slice(1) : s; const [i, f = ""] = t.split(".");
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

function num(s) {
  const t = String(s).trim().replace(/\s+/g, "").replace(/,/g, ".").replace(/^\+/, "").replace(/[−–]/g, "-");
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

function isCorrect(key, value) {
  if (typeof key === "string") return key === value; // Rounds created before sealed snapshots.
  if (key.type === "mc") return key.accepted.includes(value);
  if (key.type === "custom") return key.accepted.some((answer) => customRight(answer, value));
  const actual = numeric(value);
  return actual !== null && key.accepted.some((answer) => numeric(answer) === actual);
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
    const { set, title, keys } = data;
    if (!(typeof set === "string" && (/^X\d{2}$/.test(set) || /^sealed:[A-Za-z0-9+/=]+$/.test(set) && set.length <= 650000)) || typeof title !== "string" || title.length > 160 ||
        !Array.isArray(keys) || keys.length < 1 || keys.length > 10 || keys.some((key) =>
          typeof key === "string" ? !/^[A-D]$/.test(key) :
          !key || !["mc", "spr", "custom"].includes(key.type) || !Array.isArray(key.accepted) ||
          !key.accepted.length || key.accepted.length > 20 ||
          key.accepted.some((answer) => typeof answer !== "string" || answer.length > 64))) {
      return error(400, "Выберите от 1 до 10 вопросов.");
    }
    const round = token(), host = token();
    await db.batch([
      db.prepare("DELETE FROM live_rounds WHERE expires_at <= ?").bind(now),
      db.prepare("INSERT INTO live_rounds (id, host_token_hash, title, set_id, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(round, await hash(host), title, set, now, now + 86400000),
      ...keys.map((key, index) => db.prepare("INSERT INTO live_questions VALUES (?, ?, ?)").bind(round, index + 1, JSON.stringify(key)))
    ]);
    return reply({ round, host }, 201);
  }

  if (!validToken(id)) return error(404, "Раунд не найден.");
  const round = await db.prepare("SELECT * FROM live_rounds WHERE id = ? AND expires_at > ?").bind(id, now).first();
  if (!round) return error(404, "Раунд не найден или истёк.");
  const secret = request.headers.get("x-live-token");
  const authenticated = validToken(secret) ? await hash(secret) : null;
  const host = authenticated === round.host_token_hash;
  const started = round.starts_at;
  const { total } = await db.prepare("SELECT count(*) AS total FROM live_questions WHERE round_id = ?").bind(id).first();
  const end = started === null ? null : started + total * 45000;
  const finished = round.closed_at !== null || (end !== null && now >= end);

  if (action === "start" && host) {
    await db.prepare("UPDATE live_rounds SET starts_at = ? WHERE id = ? AND starts_at IS NULL AND closed_at IS NULL")
      .bind(now + 3000, id).run();
    return reply({ ok: true });
  }
  if (action === "close" && host) {
    await db.prepare("UPDATE live_rounds SET closed_at = ? WHERE id = ? AND closed_at IS NULL").bind(now, id).run();
    return reply({ ok: true });
  }
  if (action === "join") {
    const name = typeof data.name === "string" && data.name.trim().slice(0, 60);
    if (!name) return error(400, "Введите имя.");
    const participant = token(), student = token();
    const insert = await db.prepare(`INSERT INTO live_participants
      SELECT id, ?, ?, ?, ? FROM live_rounds WHERE id = ? AND starts_at IS NULL AND closed_at IS NULL
      AND (SELECT count(*) FROM live_participants WHERE round_id = ?) < 100`)
      .bind(participant, name, await hash(student), now, id, id).run();
    return insert.meta.changes ? reply({ participant, student }, 201) : error(409, "Вход в раунд закрыт.");
  }

  const participant = !host && authenticated && validToken(url.searchParams.get("student"))
    ? await db.prepare("SELECT id FROM live_participants WHERE round_id = ? AND id = ? AND token_hash = ?")
      .bind(id, url.searchParams.get("student"), authenticated).first()
    : null;

  if (action === "answer" && participant) {
    if (!Number.isInteger(data.number) || data.number < 1 || data.number > total || typeof data.answer !== "string" || !data.answer.trim() || data.answer.length > 64) return error(400, "Неверный ответ.");
    const question = await db.prepare("SELECT grading_json FROM live_questions WHERE round_id = ? AND number = ?").bind(id, data.number).first();
    if (!question) return error(404, "Вопрос недоступен.");
    const correct = isCorrect(JSON.parse(question.grading_json), data.answer);
    const insert = await db.prepare(`INSERT INTO live_answers
      SELECT q.round_id, ?, q.number, ?, ?, ?
      FROM live_questions q JOIN live_rounds r ON r.id = q.round_id
      WHERE q.round_id = ? AND q.number = ? AND r.closed_at IS NULL
      AND ? >= r.starts_at + (q.number - 1) * 45000 AND ? < r.starts_at + q.number * 45000
      ON CONFLICT DO NOTHING`)
      .bind(participant.id, data.answer, correct ? 1 : 0, now, id, data.number, now, now).run();
    return insert.meta.changes ? reply({ ok: true }) : error(409, "Ответ уже принят или время вышло.");
  }

  if (action === "state" && (host || participant)) {
    const state = { title: round.title, set: url.searchParams.get("snapshot") === "0" ? undefined : round.set_id, total, started, now, finished };
    if (host) {
      const [students, answers] = await db.batch([
        db.prepare("SELECT id, display_name FROM live_participants WHERE round_id = ? ORDER BY joined_at").bind(id),
        db.prepare("SELECT participant_id, question_number, answer, correct FROM live_answers WHERE round_id = ?").bind(id)
      ]);
      state.students = students.results;
      state.answers = answers.results;
      if (finished) {
        const keys = await db.prepare("SELECT grading_json FROM live_questions WHERE round_id = ? ORDER BY number").bind(id).all();
        state.keys = keys.results.map(({ grading_json }) => JSON.parse(grading_json));
      }
    } else if (participant) {
      const answers = await db.prepare("SELECT question_number, answer FROM live_answers WHERE round_id = ? AND participant_id = ?")
        .bind(id, participant.id).all();
      state.answers = answers.results;
    }
    return reply(state);
  }
  return error(403, "Доступ закрыт.");
}
