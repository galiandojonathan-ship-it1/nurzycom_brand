# Agent rules for nurzycom_brand (Codex, Claude and any other agent)

Read `CLAUDE.md` first: it is the single source of truth for the business, the hard rules, the brand and every part of the
student site. These rules add what agents working side by side need.

## Who works where

- Nurassyl (the owner) gives the tasks. Codex is the primary implementation and maintenance agent.
- Work on a branch named `codex/<short-task-name>` and open a pull request into `main`.
  Codex may review and merge its tested changes and monitor deployment without waiting for another agent.
  Every merge to `main` deploys to https://study.bynurzy.com. Coordinate concurrent work and check the latest
  `main` before merging. After merging, fast-forward `claude/ecstatic-mayer-3asg7r` while that legacy deployment remains enabled.
- One task per branch and pull request. Keep the diff to what the task needs.
- Before starting, pull the latest `main`; before opening the pull request, merge `main` into your branch again.

## What is not in this repository

- The build folder (question sources, selections, answer keys, the College Board question cache, build and test scripts)
  lives outside the repo, in Claude's workspace. Encrypted data in `docs/data/*.bin` and `docs/q/` cannot be rebuilt
  without it: leave those files alone and ask Claude for any change to questions, tests, vocabulary data or keys.
- The master key and the class code are never in the repository and must never be added. Do not try to decrypt the
  `.bin` files or `access.json`.

## Rules that are easy to miss

The full list, with the reasons, is `notes/WEBSITE_HANDOFF.md` → «5. Rules for every change»; when the two differ, that section wins.


- After any change to `docs/*.js` or `docs/site.css`, run `python3 deploy/bump_version.py` (new `?v=` cache tags).
- No inline scripts and no scripts from other hosts: `docs/_headers` sets a Content-Security-Policy (the `404.html` inline script is allowed
  by its hash; update the hash if that script changes).
- New extra pages on the student site go under «Полезное» (`docs/useful.html`, next «07.n —» number).
- Student-facing text on the course site is Russian; SAT questions, terms and slides are English.
- Never copy College Board or Barron's text into new content; never invent results, scores, reviews or statistics.
- Commit messages: a short summary line, then what changed and why. No model names in commits or pull requests.
- Check your work in a browser (Playwright is fine) before opening the pull request, and say in the pull request what
  you tested.

## «nurzycom bank» question writing
See `notes/CODEX_BANK_HANDOFF.md` (rules, files in `tools/bank/`, the sealed inbox, the paste-ready prompt).
