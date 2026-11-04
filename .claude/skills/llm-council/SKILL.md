---
name: llm-council
description: Run a council of independent AI advisors on a hard question, in the style of Karpathy's llm-council. Several sub-agents (different models and roles) answer independently, then review and rank each other's answers anonymously, then a chair writes one final answer with the disagreements made visible. Use when Nurassyl types /llm-council, asks for "a council", "second opinions" or "several perspectives", or faces a high-stakes choice for the nurzycom brand (pricing, positioning, a risky post, a business decision). Do not use for routine edits, fact lookups or design tweaks.
---

# LLM Council

One model answering alone tends to sound confident whether it is right or not. A council makes
disagreement visible: independent first answers, anonymous peer review, then a chair who
reconciles them. It costs about 9 sub-agent calls, so use it for decisions, not chores.

## Step 0. Frame the question

1. Restate the question in one or two sentences. If it is vague, ask Nurassyl one clarifying
   question first (unless the session is non-interactive).
2. Collect the context every member needs: the relevant parts of `CLAUDE.md` (business facts,
   hard rules, voice, his goals and limits), plus any file or draft the question is about.
   Paste this context into every prompt. Members do not see this conversation.

## Step 1. Independent answers (run in parallel)

Launch these five members in ONE message with the Agent tool, `run_in_background: false`, so
they answer in parallel and cannot see each other. Use the model shown to keep the council
diverse. Every prompt contains: the question, the context pack, the member's role, and the
instruction "Answer in at most 300 words. End with your single recommendation and your
confidence (low, medium, high)."

| Member | Model | Role in the prompt |
|---|---|---|
| Strategist | opus | Business and growth: what moves him toward 1,000,000 ₸ a month and a strong Instagram by summer 2027 within 20-24 hours a week. Show the maths. |
| Skeptic | sonnet | Find what is wrong, risky or untrue. Check every claim against the hard rules in CLAUDE.md (proof, consent, privacy, no guarantees, NU never called inferior). Name the worst realistic outcome. |
| Parent | sonnet | A Kazakh parent of a grade 11 NIS/BIL student who pays and verifies. What would make you trust or distrust this, and what would you pay for? Answer in their voice. |
| Student | haiku | A grade 10-12 student scrolling Instagram. Would you stop, save, share or message? Be blunt and short. |
| Creative | fable | The most original option nobody else will suggest, still within the brand voice and black-and-white style. |

Adapt the roles when the question is not about marketing (for example: a teaching question
swaps Parent for "Experienced SAT tutor"). Keep five members and at least three different models.

## Step 2. Anonymous peer review (run in parallel)

Label the five answers Response A to E in a shuffled order, with names and models removed.
Launch three reviewers in ONE message (models: opus, sonnet, fable). Each gets the question,
the context pack and all five anonymous responses, and must return:

- a ranking from best to worst, with one line of reasoning for each;
- factual errors or hard-rule violations found in any response;
- the strongest single idea across all responses.

Reviewers must not guess authorship. Keep a private key mapping letters to members.

## Step 3. Chair synthesis

You (the main session) act as chair. Compute the aggregate ranking (average rank position
across the three reviewers) and reveal which member wrote which response. Then write the final
answer for Nurassyl, in the language he used:

1. **Recommendation:** what to do, in one or two sentences.
2. **Why:** the reasoning that survived review, with numbers where they exist.
3. **Where the council disagreed:** the real split and which side you took and why.
4. **Risks and checks:** anything the Skeptic or reviewers flagged, especially hard-rule issues.
5. **Scoreboard:** a short table of members, aggregate rank and one-line summary.

Rules for the chair:

- Hard rules in CLAUDE.md beat any council vote. If the top-ranked answer breaks one, say so and
  do not recommend it.
- Do not average opinions into mush. Pick a side when the evidence supports one.
- Never present a member's guess as a verified fact. Facts still need a source.
- Keep the full transcript out of the reply. If Nurassyl wants it, save it to
  `council/YYYY-MM-DD-topic.md` and send the file.

## Cost control

- Default: 5 members + 3 reviewers + chair = 8 sub-agent calls.
- "Quick council": 3 members (Strategist, Skeptic, Parent), 1 reviewer (opus), chair.
- If a model is unavailable, substitute another and note it in the scoreboard.
