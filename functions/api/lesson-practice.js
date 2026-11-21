import { sha, isAdmin, verifyProgressOwner } from "./[[route]].js";
import { isCorrect } from "./live.js";
import { practiceTables } from "../../lib/lesson-practice-schema.js";

const respond = (value, status = 200) => Response.json(value, { status, headers: { "cache-control": "no-store" } });
const fail = (status, error) => respond({ error }, status);
const days = 14 * 86400000;
const accountId = (s) => typeof s === "string" && /^[A-Za-z0-9+/=]{16,64}$/.test(s);
const cipher = (s, max) => typeof s === "string" && s.length > 0 && s.length <= max && /^[A-Za-z0-9+/=]+$/.test(s);
const letters = ["A", "B", "C", "D"];
const skills = new Set([
  "Words in Context", "Text Structure and Purpose", "Cross-Text Connections", "Central Ideas and Details",
  "Command of Evidence", "Inferences", "Boundaries", "Form, Structure, and Sense", "Transitions", "Rhetorical Synthesis"
]);

async function review(env, rows) {
  if (!env.GEMINI_API_KEY) return fail(503, "Gemini ещё не настроен.");
  if (!rows.length) return fail(422, "У ученика нет ответов на этом уроке.");
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent", {
      method: "POST", signal: AbortSignal.timeout(18000),
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "Дай преподавателю SAT краткий отчёт по одному ученику на русском: что получилось, гипотеза о затруднении, какие ответы её поддерживают (номера, навыки), один следующий шаг и как его проверить. Оценивай подсказки отдельно: hints 1 — словарь, 2 — исключение двух вариантов, 3 — оба. Время включает ожидание и сетевую задержку: не делай вывод о подготовке по скорости. Пропуск или один ответ не доказывают слабость, явно отмечай малую выборку и отличай предположение от наблюдения. Не выдумывай содержание задания и не ставь диагноз. Не предлагай автоматически включать подсказки. Никаких имён и психологических характеристик." }] },
        contents: [{ parts: [{ text: JSON.stringify(rows) }] }],
        generationConfig: { maxOutputTokens: 550, thinkingConfig: { thinkingLevel: "minimal" } }
      })
    });
    if (response.status === 429) return fail(429, "Лимит Gemini исчерпан.");
    if (!response.ok) return fail(502, "Gemini не ответил. Повторите анализ ученика.");
    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.filter((p) => !p.thought && typeof p.text === "string").map((p) => p.text).join("\n").trim();
    return text ? text.slice(0, 2800) : fail(502, "Gemini не вернул анализ.");
  } catch { return fail(502, "Не удалось связаться с Gemini."); }
}

function validQuestion(data) {
  const { ref, snapshot, kind, accepted } = data || {};
  return typeof ref === "string" && /^([VM]\d{2}|VA|MD)\.[a-z0-9]{1,10}\.\d{1,3}$/.test(ref) && cipher(snapshot, 170000) &&
    ["mc", "spr"].includes(kind) && Array.isArray(accepted) && accepted.length <= 20 &&
    accepted.every((a) => typeof a === "string" && a.trim() && a.length <= 64) &&
    (kind === "mc" ? (accepted.length === 1 && letters.includes(accepted[0])) ||
      (accepted.length === 0 && ref.split(".")[1] === "slide") : accepted.length > 0);
}
const coldStep = (ref) => /:cold:([1-4])$/.exec(ref || "")?.[1];

const hostActions = new Set(["create", "show", "cold", "advance", "pause", "close", "host", "profile", "report"]);
const getActions = new Set(["host", "state"]);
export async function onRequest({ env, request }) {
  const db = env.LIVE_LESSONS;
  if (!db || !env.USERS) return fail(503, "Хранилище урока не подключено.");
  const url = new URL(request.url), id = url.searchParams.get("room"), action = url.searchParams.get("action");
  if (request.headers.get("origin") && request.headers.get("origin") !== url.origin) return fail(403, "Доступ закрыт.");
  if (request.method !== (getActions.has(action) ? "GET" : "POST")) return fail(405, "Метод недоступен.");
  const host = hostActions.has(action);
  if (host && !(await isAdmin(env, request))) return fail(403, "Требуется доступ преподавателя.");
  let data = {};
  if (request.method === "POST") {
    const raw = await request.text();
    if (raw.length > (action === "cold" ? 700000 : 180000)) return fail(413, "Слишком большой запрос.");
    try { data = JSON.parse(raw); } catch { return fail(400, "Неверный запрос."); }
    if (!data || Array.isArray(data) || typeof data !== "object") return fail(400, "Неверный запрос.");
  }
  const now = Date.now();
  const sql = (text, ...values) => db.prepare(text).bind(...values);

  if (action === "create") {
    if (typeof data.title !== "string" || !data.title.trim() || data.title.length > 160) return fail(400, "Введите название урока.");
    await db.batch(practiceTables.map((text) => sql(text)));
    await sql("DELETE FROM lp_rooms WHERE id IN (SELECT id FROM lp_rooms WHERE expires_at < ? LIMIT 10)", now).run();
    const room = crypto.randomUUID();
    await sql("INSERT INTO lp_rooms (id, title, expires_at) VALUES (?, ?, ?)", room, data.title.trim(), now + days).run();
    return respond({ room }, 201);
  }

  if (!/^[a-f0-9-]{36}$/.test(id || "")) return fail(404, "Урок не найден.");
  const room = await sql("SELECT * FROM lp_rooms WHERE id = ? AND expires_at > ?", id, now).first();
  if (!room) return fail(404, "Урок не найден или срок ссылки истёк.");
  if (!room.closed_at && now >= room.expires_at - days + 10800000) {
    await sql("UPDATE lp_rooms SET closed_at=?,current=NULL WHERE id=? AND closed_at IS NULL", now, id).run();
    room.closed_at = now; room.current = null;
  }

  // A presentation can refresh before loading the current state. An automatic action must not interrupt a cold start.
  const keepSeries = "AND NOT EXISTS (SELECT 1 FROM lp_questions lp WHERE lp.room=r.id AND lp.number=r.current AND lp.ref GLOB '*:cold:[1-4]')";
  const automatic = action === "show" && data.automatic === true;

  function insertQuestion(question, ref, series) {
    // Reserve room for the entire series before inserting each item. This also makes an identical retry safe.
    const capacity = series
      ? "(SELECT COUNT(*) FROM lp_questions WHERE room=r.id) + (4-(SELECT COUNT(*) FROM lp_questions WHERE room=r.id AND ref IN (?,?,?,?))) <= 100"
      : "(SELECT COUNT(*) FROM lp_questions WHERE room=r.id) < 100";
    return sql(`INSERT INTO lp_questions (room,number,ref,snapshot,kind,accepted,skill)
      SELECT r.id,COALESCE((SELECT MAX(number) FROM lp_questions WHERE room=r.id),0)+1,?,?,?,?,?
      FROM lp_rooms r WHERE r.id=? AND r.closed_at IS NULL AND ${capacity} ${automatic ? keepSeries : ""} ON CONFLICT DO NOTHING`,
    ref, question.snapshot, question.kind, JSON.stringify(question.accepted), skills.has(question.skill) ? question.skill : "SAT", id, ...(series || []));
  }
  if (action === "show" || action === "cold") {
    if (room.closed_at) return fail(409, "Урок уже завершён.");
    const cold = action === "cold";
    const questions = cold ? data.questions : [data];
    if (!Array.isArray(questions) || questions.length !== (cold ? 4 : 1) ||
        questions.some((q) => !validQuestion(q)) || new Set(questions.map((q) => q.ref)).size !== questions.length ||
        (cold && new Set(questions.map((q) => q.ref.split(".")[0])).size !== 1)) {
      return fail(400, cold ? "Для холодного старта нужны четыре вопроса этого урока." : "Вопрос не удалось подготовить.");
    }
    const refs = questions.map((q, i) => cold ? `${q.ref}:cold:${i + 1}` : q.ref);
    const writes = questions.map((q, i) => insertQuestion(q, refs[i], cold ? refs : null));
    const activate = cold
      ? sql(`UPDATE lp_rooms SET current=CASE
          WHEN current IN (SELECT number FROM lp_questions WHERE room=? AND ref IN (?,?,?,?)) THEN current
          ELSE (SELECT number FROM lp_questions WHERE room=? AND ref=?) END
        WHERE id=? AND closed_at IS NULL AND
          (SELECT COUNT(*) FROM lp_questions WHERE room=? AND ref IN (?,?,?,?))=4`, id, ...refs, id, refs[0], id, id, ...refs)
      : sql(`UPDATE lp_rooms AS r SET current=(SELECT number FROM lp_questions WHERE room=? AND ref=?)
        WHERE r.id=? AND r.closed_at IS NULL AND EXISTS (SELECT 1 FROM lp_questions WHERE room=? AND ref=?) ${automatic ? keepSeries : ""}`, id, refs[0], id, id, refs[0]);
    const results = await db.batch([...writes, activate]);
    if (results.at(-1).meta.changes) return respond({ ok: true });
    if (automatic && await sql(`SELECT 1 AS active FROM lp_rooms r JOIN lp_questions q ON q.room=r.id AND q.number=r.current
      WHERE r.id=? AND q.ref GLOB '*:cold:[1-4]'`, id).first()) return respond({ keptCold: true });
    return fail(409, "Урок завершён или достигнут предел в 100 вопросов.");
  }
  if (action === "advance") {
    if (!Number.isInteger(data.number) || data.number !== room.current || room.closed_at) return fail(409, "Вопрос уже изменился. Обновите монитор.");
    const current = await sql("SELECT ref FROM lp_questions WHERE room=? AND number=?", id, data.number).first();
    const step = Number(coldStep(current?.ref));
    if (!step) return fail(409, "Холодный старт не запущен.");
    const next = step < 4 ? await sql("SELECT number,ref FROM lp_questions WHERE room=? AND number=?", id, data.number + 1).first() : null;
    const group = (ref) => ref.split(".")[0];
    if (step < 4 && (Number(coldStep(next?.ref)) !== step + 1 || group(next.ref) !== group(current.ref))) return fail(409, "Серия вопросов неполная.");
    const result = await sql("UPDATE lp_rooms SET current=? WHERE id=? AND current=? AND closed_at IS NULL", next?.number || null, id, data.number).run();
    return result.meta.changes ? respond({ ok: true }) : fail(409, "Вопрос уже изменился. Обновите монитор.");
  }
  if (action === "pause" || action === "close") {
    if (action === "close") await sql("UPDATE lp_rooms SET closed_at=?,current=NULL WHERE id=? AND closed_at IS NULL", now, id).run();
    else await sql(`UPDATE lp_rooms AS r SET current=NULL WHERE r.id=? AND r.closed_at IS NULL ${keepSeries}`, id).run();
    return respond({ ok: true });
  }
  if (action === "host") {
    const all = url.searchParams.get("all") === "1" || !!room.closed_at;
    const scope = all ? [] : [room.current];
    const [members, attempts, questions] = await db.batch([
      sql(`SELECT m.account,m.report,p.hints FROM lp_members m LEFT JOIN lp_profiles p ON p.account=m.account
        WHERE m.room=? ORDER BY m.joined_at`, id),
      sql(`SELECT a.account,a.number,a.answer,a.correct,a.submitted_at-a.opened_at AS ms,a.hints,q.ref,q.skill
        FROM lp_attempts a JOIN lp_questions q ON q.room=a.room AND q.number=a.number
        WHERE a.room=? AND a.submitted_at IS NOT NULL ${all ? "" : "AND a.number=?"} ORDER BY a.number`,
      id, ...scope),
      sql("SELECT number,ref,skill FROM lp_questions WHERE room=? ORDER BY number", id)
    ]);
    return respond({ title: room.title, current: room.current, closed: !!room.closed_at, members: members.results,
      attempts: attempts.results, questions: questions.results,
      cold: Number(coldStep(questions.results.find((q) => q.number === room.current)?.ref)) || null });
  }
  if (action === "profile" || action === "report") {
    if (!accountId(data.account) || !await sql("SELECT account FROM lp_members WHERE room=? AND account=?", id, data.account).first()) return fail(404, "Ученик не найден в этом уроке.");
    if (action === "profile") {
      if (data.hints === undefined) return respond(await sql("SELECT hints,note FROM lp_profiles WHERE account=?", data.account).first() || { hints: 0, note: "" });
      if (!Number.isInteger(data.hints) || data.hints < 0 || data.hints > 3 || !(data.note === "" || cipher(data.note, 6000))) return fail(400, "Проверьте запись.");
      await sql(`INSERT INTO lp_profiles VALUES (?,?,?) ON CONFLICT(account) DO UPDATE SET hints=excluded.hints,note=excluded.note`,
        data.account, data.hints, data.note).run();
      return respond({ ok: true });
    }
    if (!room.closed_at) return fail(409, "Сначала завершите урок.");
    const old = await sql("SELECT report FROM lp_members WHERE room=? AND account=?", id, data.account).first();
    if (old.report) return respond({ report: old.report });
    const { results } = await sql(`SELECT q.number,q.skill,a.correct,a.hints,a.submitted_at-a.opened_at AS ms
      FROM lp_questions q LEFT JOIN lp_attempts a ON a.room=q.room AND a.number=q.number AND a.account=?
      WHERE q.room=? AND q.accepted<>'[]'
      AND EXISTS(SELECT 1 FROM lp_attempts seen WHERE seen.room=q.room AND seen.number=q.number)
      ORDER BY q.number`, data.account, id).all();
    if (!results.some((r) => r.correct !== null)) return fail(422, "У ученика нет проверенных ответов на этом уроке.");
    const report = await review(env, results);
    if (typeof report !== "string") return report;
    await sql("UPDATE lp_members SET report=? WHERE room=? AND account=?", report, id, data.account).run();
    return respond({ report });
  }

  if (action === "join") {
    const auth = await verifyProgressOwner(env, request, data.account, request.headers.get("x-sync") || "");
    if (auth !== 200) return fail(auth, "Войдите под своим учебным аккаунтом.");
    const member = await sha(`lesson-practice:${id}:${request.headers.get("x-sync")}`);
    await sql(`INSERT INTO lp_members (room,account,token_hash,joined_at)
      SELECT id,?,?,? FROM lp_rooms WHERE id=? AND closed_at IS NULL
      AND (SELECT COUNT(*) FROM lp_members WHERE room=?)<100 ON CONFLICT DO NOTHING`,
    data.account, await sha(member), now, id, id).run();
    const saved = await sql("SELECT token_hash FROM lp_members WHERE room=? AND account=?", id, data.account).first();
    if (!saved || saved.token_hash !== await sha(member)) return fail(409, "Вход закрыт или этот аккаунт уже подключён под прежним паролем.");
    return respond({ member });
  }

  const account = url.searchParams.get("account"), secret = request.headers.get("x-practice-token");
  if (!accountId(account) || !/^[a-f0-9]{64}$/.test(secret || "")) return fail(403, "Войдите в урок по ссылке.");
  const student = await sql(`SELECT m.account,COALESCE(p.hints,0) AS hints FROM lp_members m LEFT JOIN lp_profiles p ON p.account=m.account
    WHERE m.room=? AND m.account=? AND m.token_hash=?`, id, account, await sha(secret)).first();
  if (!student) return fail(403, "Войдите в урок по ссылке.");
  const question = room.current && (action !== "state" || url.searchParams.get("number") !== String(room.current))
    ? await sql("SELECT * FROM lp_questions WHERE room=? AND number=?", id, room.current).first() : null;
  if (action === "state") {
    const attempt = room.current ? await sql(`SELECT hints,answer,submitted_at-opened_at AS ms FROM lp_attempts
      WHERE room=? AND account=? AND number=?`, id, account, room.current).first() : null;
    let removed;
    if (attempt?.hints & 2) {
      const key = question || await sql("SELECT accepted FROM lp_questions WHERE room=? AND number=?", id, room.current).first();
      const [answer] = JSON.parse(key.accepted);
      if (answer) removed = letters.filter((l) => l !== answer).slice(0, 2);
    }
    return respond({ title: room.title, current: room.current, closed: !!room.closed_at, snapshot: question?.snapshot, cold: Number(coldStep(question?.ref)) || undefined, hints: student.hints, attempt, removed });
  }
  if (room.closed_at || !question || data.number !== room.current) return fail(409, "Преподаватель уже переключил вопрос.");
  // Opening is acknowledged once. A resubmission or refresh keeps the original clock and first answer.
  if (action === "open") {
    const result = await sql(`INSERT INTO lp_attempts (room,account,number,opened_at)
      SELECT id,?,current,? FROM lp_rooms WHERE id=? AND current=? AND closed_at IS NULL ON CONFLICT DO NOTHING`,
    account, now, id, data.number).run();
    return respond({ ok: true, opened: !!result.meta.changes });
  }
  const accepted = JSON.parse(question.accepted);
  if (action === "hint") {
    if (![1, 2].includes(data.hint) || !(student.hints & data.hint) ||
        (data.hint === 2 && (question.kind !== "mc" || accepted.length !== 1))) return fail(403, "Подсказка недоступна.");
    const result = await sql(`UPDATE lp_attempts SET hints=hints|? WHERE room=? AND account=? AND number=? AND answer IS NULL
      AND EXISTS (SELECT 1 FROM lp_rooms WHERE id=? AND current=? AND closed_at IS NULL)`, data.hint, id, account, data.number, id, data.number).run();
    return result.meta.changes ? respond({ removed: data.hint === 2 ? letters.filter((l) => l !== accepted[0]).slice(0, 2) : undefined })
      : fail(409, "Подсказка больше недоступна.");
  }
  if (action === "answer") {
    if (typeof data.answer !== "string" || !data.answer.trim() || data.answer.length > 64 ||
        (question.kind === "mc" && !letters.includes(data.answer))) return fail(400, "Введите ответ.");
    const correct = accepted.length ? Number(isCorrect({ type: question.kind, accepted }, data.answer)) : null;
    await sql(`UPDATE lp_attempts SET answer=?,correct=?,submitted_at=? WHERE room=? AND account=? AND number=? AND answer IS NULL
      AND EXISTS (SELECT 1 FROM lp_rooms WHERE id=? AND current=? AND closed_at IS NULL)`,
    data.answer, correct, now, id, account, data.number, id, data.number).run();
    const saved = await sql("SELECT answer,submitted_at-opened_at AS ms FROM lp_attempts WHERE room=? AND account=? AND number=?", id, account, data.number).first();
    return saved?.answer ? respond(saved) : fail(409, "Ответ не принят. Вопрос уже изменился.");
  }
  return fail(404, "Действие недоступно.");
}
