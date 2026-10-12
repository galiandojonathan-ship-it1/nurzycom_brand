# nurzycom: personal tutoring brand of Nurassyl Kunanbayev

You are continuing work on the personal brand and tutoring business of Nurassyl Kunanbayev (@nurzycom), a Chemical Engineering student at Nazarbayev University (NU), Kazakhstan. The goal is to turn his academic record into paying students now and a brand-based business later.

**Read `.agents/product-marketing.md` before any marketing, copy or design task.** It is the single source of truth for positioning, audience, prices, proof, competitors and voice. When facts change, update it: bump the version, update "Last updated", and add one changelog line at the top (newest first).

## The business in brief

- **Offers:** SAT Reading & Writing (small group 3-5 students and 1:1), IELTS Writing (1:1), Organic Chemistry I (1:1, university level, in English). SAT Math and olympiad prep exist only as possible later offers.
- **Launch prices:** group 35,000 ₸/month (8 × 90 min); SAT RW 1:1 8,000 ₸/h, pack of 8 for 60,000 ₸; IELTS Writing 7,000 ₸/h, essay review 3,000 ₸; OrgChem $20/h, pack of 10 for $180. Raise only after verified results are published.
- **Audience:** grade 9-12 students in Kazakhstan (NIS, BIL, RFMSH) applying to NU or abroad, and their parents (who pay and verify). Also university students needing organic chemistry.
- **Customer insight:** students need "something to prove their competence" for universities and summer programs. Headline idea: *Scores that prove what you're capable of.*
- **Conversion action:** free 20-minute consultation with a short diagnostic. Telegram @nurzycom (primary), WhatsApp +7 705 421 1262 (https://wa.me/77054211262).
- **Status (2026-10-12):** Instagram 425 followers, LinkedIn small, 3 paying students (2 SAT via an employer company, 1 OrgChem).

## Verified credentials (safe to publish)

- SAT 1560 superscore; IELTS 8.0 overall, 8.0 Writing
- Perfect 5.0/5.0 GPA every term for six years at NIS
- Chemistry olympiads: 2023 national gold and gold at the International Tuymaada Olympiad; 2024 national silver (top 6) and Tuymaada bronze
- Admitted to NYU Abu Dhabi (formal offer), chose NU
- A student he tutored finished Organic Chemistry I at UC San Diego Extended Studies with a 92.4% final grade (publish unnamed, as a result only)

## Hard rules (never break these)

1. **Never invent reviews, testimonials, quotes, scores or statistics.** No review exists for the UCSD student; show the grade only. If proof is missing, write a visible placeholder like `[Score]` and tell Nurassyl.
2. **Official scores only.** Practice-test scores and expected scores are never published as results.
3. **Consent first.** Publish a student's name, score or words only with written consent, plus a parent's consent if under 18. Anonymous is fine ("Student, grade 11").
4. **Shared students stay off public materials for now.** Alan, Dastan and Nurislam were taught through an employer company and partly by another tutor (Karakat). Do not use their results until permission and fair wording are settled. Never claim sole credit. Never suggest poaching company students.
5. **Do not publish** an IQ score or the unverified "0.6% NYUAD acceptance rate".
6. **No guarantees.** Never promise a specific score; offer "a realistic range after the diagnostic".

## Brand identity

- **Personality:** Precise. Driven. Warm. The credible older-brother mentor. Confident, never arrogant.
- **Voice:** short sentences, concrete numbers, practical advice. Use: results, plan, step by step, verified score, error log, realistic range. Avoid: genius, secret, guaranteed, hack, IQ, exclamation marks, AI-sounding patterns ("it's not X, it's Y", stacked negation lists).
- **Colours:** Ink #0A0A0A, Paper #FAF8F3, Gold #C9A24B (on black only), Deep gold #7A5C14 (gold accents on light backgrounds), Stone #4A4740 (secondary text). White and black dominate; gold stays under 15% of a layout. Never gold text on white.
- **Type (website, chosen 2026-10-12):** Noto Serif Display Light 300 Italic for the name, headlines and big numbers (40px and larger only: its hairlines vanish at small sizes); Geist 400-500 for body and buttons; IBM Plex Mono 400 in small spaced capitals for labels and metadata (the fashion-poster detail). All free on Google Fonts and all cover Russian and Kazakh letters. Cormorant Garamond + Manrope remain the fallback pairing used in the older `design/` files.
- **Logo:** "NK" in Cormorant Garamond inside a thin hexagon outline (nod to the benzene ring). Inline SVG is in every file in `design/`.
- **Photos:** his real face on every profile picture; black and white for Instagram/Telegram, colour for LinkedIn. AI may polish real photos (light, background) but never replace or alter his appearance.
- **Languages:** Russian for parent-facing social content, English for the website and SAT/IELTS examples, some Kazakh.

## The teaching method (use in copy)

1. **Diagnose:** official Bluebook practice test; every mistake sorted by question type in an error log.
2. **Target:** lessons on the 2-3 question types losing the most points; a timed module every week.
3. **Prove:** full practice test every 2-3 weeks; short score update to parents.

## Files in this project

- `.agents/product-marketing.md`: brand foundation document (v3). Read first.
- `design/`: source of the design canvas made in Claude (format: Claude Design `.dc.html` components; mostly plain HTML with inline styles inside `<x-dc>` tags).
  - `Main.dc.html`: one-page website (EN)
  - `BrandKit.dc.html`: logo, colours, type, voice, photo guide
  - `IG-Intro.dc.html`, `IG-Result.dc.html`, `IG-Tip.dc.html`: Instagram 1080×1350 templates (RU)
  - `LinkedIn-Banner.dc.html`: 1584×396 banner
  - `Highlights.dc.html`: Instagram highlight covers
- `site/`: the live one-page website (EN), plain HTML/CSS/JS with no build step. `index.html`, `styles.css`, `main.js`, `assets/portrait.webp` (hero photo), `assets/og.jpg` (link preview). Black-and-white only, no gold. Sections: name hero → verified results → lessons and prices → method → story → FAQ → contact. Unfilled facts are marked with red dashed `.todo` spans; search for `todo` before publishing.
- The live, editable design canvas is in Nurassyl's Claude account: https://claude.ai/artifact/5fR9rzHko1kNuSNpoKb4RJ (private).

## Open items (waiting on Nurassyl)

- Portrait and candid photo to replace `[Your portrait]` / `[Candid photo]` placeholders
- Payment method for the FAQ (`[payment method]`, e.g. Kaspi transfer)
- LinkedIn profile URL (footer `[LinkedIn URL]`)
- October 2026 SAT official scores and consent (Mukhamediya is his own individual student; results card `[Score]`)
- Ansara's final Organic Chemistry grade (University of Cincinnati)
- Registration as self-employed or individual entrepreneur in Kazakhstan

## Suggested next tasks

1. Convert `design/Main.dc.html` into a deployable static site (`site/index.html` + CSS): strip the `<x-dc>`, `<helmet>` and `support.js` wrapper, keep the markup and styles, check it at 375px width, and prepare it for free hosting (GitHub Pages, Netlify or Vercel) and a domain such as nurzy.com or a .kz domain.
2. Add a Russian version of the site with a language switch.
3. Write the full 6-slide "3 mistakes in SAT Reading & Writing" carousel (RU) in the `IG-Tip` style.
4. Plan a 4-week content calendar: about 3 posts a week across exam tips, his journey, admissions, chemistry and a little personality (gym, discipline: max 15%).
5. Build a free lead magnet (e.g. a one-page SAT RW error-log template) to collect contacts via Telegram.

## Useful tools

- Marketing skills: `npx skills add coreyhaines31/marketingskills -a claude-code` (product-marketing, copywriting, copy-editing, social, content-strategy, offers, pricing, lead-magnets). Every skill reads `.agents/product-marketing.md` first.
- Video (Reels intros, animated results): `npx skills add heygen-com/hyperframes` (needs Node.js 22+ and FFmpeg).

## Working style

Nurassyl wants a company-level, premium look and finished work, not just advice. Do what you can yourself, mark what depends on him clearly, and keep him honest on proof: credibility with parents is the whole business.
