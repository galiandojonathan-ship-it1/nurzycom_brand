// Live rounds use D1 so the host sees committed answers on the next poll.
const headers = { "content-type": "application/json", "cache-control": "no-store" };
const reply = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });
const error = (status, message) => reply({ error: message }, status);
const token = () => crypto.randomUUID().replaceAll("-", "");
const validToken = (value) => /^[a-f0-9]{32}$/.test(value || "");
const hash = async (value) => Array.from(new Uint8Array(await crypto.subtle.digest(
  "SHA-256", new TextEncoder().encode(value)
)), (byte) => byte.toString(16).padStart(2, "0")).join("");

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
    if (raw.length > 3000) return error(413, "Слишком большой запрос.");
    try { data = JSON.parse(raw); } catch { return error(400, "Неверный запрос."); }
    if (!data || typeof data !== "object") return error(400, "Неверный запрос.");
  }

  if (action === "create") {
    const key = request.headers.get("x-admin-key");
    const adminHash = key && env.USERS && await env.USERS.get("admin");
    if (!adminHash || await hash("bynurzy-admin:" + key) !== adminHash) return error(403, "Откройте кабинет преподавателя в этом браузере.");
    const { set, title, keys } = data;
    if (!/^X\d{2}$/.test(set) || typeof title !== "string" || title.length > 160 ||
        !Array.isArray(keys) || keys.length !== 10 || keys.some((key) => !/^[A-D]$/.test(key))) {
      return error(400, "Выберите набор из 10 вопросов с вариантами ответа.");
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
  const end = started === null ? null : started + 450000;
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
    if (!Number.isInteger(data.number) || data.number < 1 || data.number > 10 || !/^[A-D]$/.test(data.answer)) return error(400, "Неверный ответ.");
    const insert = await db.prepare(`INSERT INTO live_answers
      SELECT q.round_id, ?, q.number, ?, q.grading_json = ?, ?
      FROM live_questions q JOIN live_rounds r ON r.id = q.round_id
      WHERE q.round_id = ? AND q.number = ? AND r.closed_at IS NULL
      AND ? >= r.starts_at + (q.number - 1) * 45000 AND ? < r.starts_at + q.number * 45000
      ON CONFLICT DO NOTHING`)
      .bind(participant.id, data.answer, JSON.stringify(data.answer), now, id, data.number, now, now).run();
    return insert.meta.changes ? reply({ ok: true }) : error(409, "Ответ уже принят или время вышло.");
  }

  if (action === "state" && (host || participant)) {
    const state = { title: round.title, set: round.set_id, started, now, finished };
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
