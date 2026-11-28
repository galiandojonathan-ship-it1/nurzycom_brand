# Handoff: «nurzycom bank» question writing (Claude → Codex), 2026-11-24

## What this is
Nurassyl asked for a bank of our own original Digital SAT questions («nurzycom bank»): sets of 10 questions per subtopic of
the progress taxonomy (53 subtopics), each set with 3 «контрольные» questions and at least one genuinely hard question,
international themes only, topical vocabulary in every Reading and Writing passage, Russian explanations. Teachers browse
it in the cabinet section «nurzycom bank» (`docs/nbank.js`) and turn picks into a «Мой тест».

State on 2026-11-24 01:00 UTC: 139 questions in 13 subtopics are verified and in the bank (encrypted:
`notes/private/nurzycom-bank.bin` on branch `claude/nurzycom-bank`; site data `docs/data/nbank.bin`). Claude keeps writing
the subtopics in its own queue overnight. **Codex writes the 32 sets listed in `tools/bank/QUEUE_CODEX.md`.**

## Why the inbox
The repository is public and Codex has no course master key (AGENTS.md). So Codex never sees the bank or student data, and
never commits a question in plain text. Each finished set is sealed with the public key `tools/bank/inbox_pub.json`
(`tools/bank/seal_inbox.mjs`: AES-256-GCM + RSA-OAEP) into `notes/bank-inbox/<set>.bin`. Only Claude can open it (the private
key is sealed with the master key in `notes/private/bank-inbox-key.bin`). Claude then blind-verifies every question with a
second model, recomputes Math keys, drops anything ambiguous or duplicated, merges the rest into the bank and rebuilds
`docs/data/nbank.bin`.

## Files for Codex (all in `tools/bank/`)
- `SPEC.md` — the full writing rules (format, levels, control questions, the hard-question self-test, authenticity, themes,
  vocabulary, explanations, JSON output) and a public-safe summary of the private SAT pattern study.
- `taxonomy.md` — subtopic and trap codes. `skill_of.json` — subtopic → College Board skill.
- `check.py` — `python3 tools/bank/check.py check <set.json>`: format, levels, control count, hard flag, banned themes, Math
  `check` snippets run with sympy against the key, near-duplicates inside the set. It also writes `<set>.blind.json` (ignore).
- `seal_inbox.mjs` — `node tools/bank/seal_inbox.mjs <set.json>` → `notes/bank-inbox/<sub>-<set>.bin`.
- `QUEUE_CODEX.md` — your 32 sets, in order; mark each «sealed» when its .bin is committed.
- Work folder `tools/bank/work/` is git-ignored: keep the plain JSON there and nowhere else.

## Rules that are easy to miss
- Never commit a plain-text question, answer key or explanation (only `notes/bank-inbox/*.bin`).
- Never copy College Board, Barron's or PrepPros text, and never «change the numbers» of a published question: write your own
  context, wording, numbers and options. Book question types and techniques are fine as inspiration.
- International themes only: no Kazakhstan, Kyrgyzstan, Central Asia, Russia or the post-Soviet region; no current politics,
  wars or religion (check.py rejects the names).
- Facts must be well established; research summaries may use fictional teams but must not contradict science or put invented
  words in a real person's mouth. No literary quotations.
- «Hard» means hard for a human 1450+ student on the real SAT hard module, not long: follow the self-test in SPEC.md. Claude's
  blind reviewer re-rates every level and keeps the lower one; so far it downgraded most writer «hard» questions, so aim higher.
- After each set: solve every question yourself again from scratch, in a fresh pass, before sealing (Claude still verifies).

## Prompt to paste into Codex
```
Read AGENTS.md, then notes/CODEX_BANK_HANDOFF.md and tools/bank/SPEC.md in full.
Task: write the «nurzycom bank» question sets listed in tools/bank/QUEUE_CODEX.md, in order, as many as you can.
For each set: write the JSON to tools/bank/work/<sub>-<n>.json following SPEC.md exactly (10 questions: 7 target + 3 control,
levels 1 E / 3 M / 6 H, at least one "hard": true that passes the hard self-test, topical vocabulary cards for every RW
passage, Russian explanations; Math questions with a sympy `check`). Run `python3 tools/bank/check.py check <file>` and fix
everything it reports. Then solve all 10 again from scratch without looking at your keys; fix or replace any question where
your second answer differs or two options are defensible. Seal it: `node tools/bank/seal_inbox.mjs <file>`.
Never commit the plain JSON (tools/bank/work/ is git-ignored). Mark the set «sealed» in tools/bank/QUEUE_CODEX.md.
Commit the sealed .bin files and the queue on a branch codex/bank-<first-set>-<last-set> and open one pull request into main
per 4–6 sets; title «nurzycom bank: sealed sets …». Do not merge it: Claude opens, verifies and merges the inbox.
Do not touch docs/, notes/private/ or any other file.
```

## What Claude does with an inbox pull request
1. `node tools/private/unpack.mjs <master_key.b64> notes/private/bank-inbox-key.bin <dir>` → `inbox_private.jwk.json`.
2. `node tools/bank/open_inbox.mjs <dir>/inbox_private.jwk.json <bank>/sets <files>` → plain sets in Claude's scratch folder.
3. The usual pipeline: `tools.py check`, blind verifier (VERIFY.md), `tools.py merge`, `save.sh`, `build_site.py`.
4. Merge the pull request after deleting the opened .bin files from `notes/bank-inbox/` (they are in the sealed bank now).
