# Prompt for a new chat: make study.bynurzy.com safe and recoverable

Copy everything below the line into a new Claude Code chat on this repository.

---

You are working on Nurassyl's course site study.bynurzy.com (repository `nurzycom_brand`, folder `docs/`, Cloudflare Pages
project `bynurzy-study`). Read `CLAUDE.md` and `notes/WEBSITE_HANDOFF.md` first; they are the source of truth.

## Goal

The code is safe in GitHub. Everything else is not: if the Cloudflare account, a key or a binding is lost or broken, students'
accounts, results and my teaching data could be gone for good. Make the site **recoverable from zero** and **harder to break
into**, without changing how students and I use it. Reply to me in Russian, with English names for buttons and menus.

## What lives outside GitHub (check and complete this list from the handoff and the code before anything else)

1. **The master key** (AES-GCM) that encrypts every `docs/data/*.bin`, `docs/q/**`, KV copy and `notes/private/*.bin`. Without it
   nothing can be read again. It is wrapped with passwords in `docs/access.json` and KV, but no plain copy is stored anywhere safe.
2. **Cloudflare KV namespace `USERS`** (bound as `USERS`): accounts `u:<id>`, each student's synced copy `p:<id>` (results,
   plan, tasks, Bluebook shares `bb_share_`, targets `goal_target`, lesson sessions `ls_s_` / reviews `ls_r_`, live round records
   `lv_r_`), `groups`, `form` (Google Form CSV), `custom` («Мои тесты», Gemini tests), `invite`, `admin`, uploaded decks. Find every
   key prefix in `functions/api/*.js`.
3. **Cloudflare D1 `LIVE_LESSONS`** (live practice rounds; schema `deploy/live-lesson-d1.sql`). Probably short-lived data: confirm.
4. **Cloudflare Pages settings**: bindings (KV, D1), environment variables and secrets (`GEMINI_API_KEY` and any others), custom
   domain `study.bynurzy.com`, build settings (branch `main`, output `docs`).
5. **The domain bynurzy.com and its DNS** (registrar, Cloudflare DNS records).
6. **Credentials**: the admin key (in my browser as `admin_key`), the class code, Claude's course login `claude`, my own login,
   the GitHub token used by «Пароль сайта», the Cloudflare and registrar accounts.
7. **Teaching sources not in the repo**: the old build folder is already gone (see the handoff); note what else exists only in
   my chats or my computer (lesson PDFs, presentations) and where it should be kept.

## Tasks, in this order

1. **Inventory.** Produce a table: item · where it lives · what breaks if it is lost · how it is backed up today · proposed backup.
   Show it to me before building anything.
2. **Master key escrow.** Walk me through keeping the master key in two places only I control (for example a password manager
   such as Bitwarden or 1Password, plus a printed copy at home). Never write the key into the repository, a commit, a pull
   request, a log or a file outside the session scratchpad; delete the scratchpad copy when done.
3. **Automatic backups of KV and D1.** Propose the simplest reliable option and its cost before building, for example a
   scheduled Cloudflare Worker or GitHub Actions job that exports every KV key (values are already encrypted with the master key,
   so the backup stays encrypted) and a D1 dump to a private place with versions (Cloudflare R2 in a separate bucket, a
   **private** backup repository, or my Google Drive). Weekly at least, keep several weeks, and alert me if a run fails. Use a
   Cloudflare API token with the narrowest rights (read KV, read D1, write to the backup target only).
4. **Restore drill.** Write `tools/backup/restore` that loads a backup into the local stand-in (`tools/sitetests/pages_dev.mjs`)
   and prove it: a test student can log in, sees results, targets and Bluebook shares, and the teacher cabinet reads them. Never
   write to the production KV without asking me first.
5. **Recovery runbook** `notes/RECOVERY.md` (public file, so no secrets): how to rebuild from zero, step by step with English
   button names: new Cloudflare Pages project, bindings, secrets, custom domain and DNS, restoring KV and D1, where each key is
   kept, and how long it takes.
6. **Hardening.** Check and fix, or tell me exactly what to click:
   - rotate what was pasted in chats: the admin key, Claude's `claude` password, student passwords shared in chat (Sher);
   - switch off the old shared password, then make the repository private (old `access.json` copies in git history hold the
     master key wrapped with the old class code);
   - two-factor login on Cloudflare, GitHub, the domain registrar and Google; registrar lock and auto-renew for bynurzy.com;
   - limit login and sign-up guessing (rate limits on the account and admin routes), review `docs/_headers` (CSP and others);
   - the GitHub token for «Пароль сайта»: fine-grained, this repository only, Contents read and write, with an expiry date.
7. **Report** what is done, what I must do myself (with exact steps), and the remaining risks.

## Rules

- Hard rules in `CLAUDE.md` stay: no secrets in the repository, student data never leaves encryption, no published results.
- Ask me before: any write or delete in production KV or D1, creating paid services, changing DNS, or making the repo private.
- Website changes follow «Working style» in `CLAUDE.md` (tests, `deploy/bump_version.py`, merge, check live).
- Done means: a backup ran automatically and was restored locally in a test, the runbook exists, the master key is stored
  in two safe places (I confirm), and the exposed credentials are rotated (I confirm).
