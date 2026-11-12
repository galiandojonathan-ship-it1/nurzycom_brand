# Browser tests for experimental/

Playwright tests used for every change to the experimental site. Screenshots go to `$SHOTS` (default: the system temp folder).

```sh
cd experimental && python3 -m http.server 8791 &          # serve the site
node tools/tests/site.test.js                            # all pages at 320, 360, 1280 px; every lesson with all keys → full score;
                                                         # paging, slides fit, office hours → retry → four-step grid
node tools/tests/ielts_formats.test.js                   # heading matching, gap-fill, word limits, office labels, retry
python3 tools/bundle_single_html.py /tmp/site.html && node tools/tests/single_file.test.js /tmp/site.html
```

Needs Node.js and Playwright with Chromium (`npm i -D playwright && npx playwright install chromium`). Each prints `ALL OK` or the failures.
`answer_all.js` answers every question on a lesson page with its key (or a wrong answer for chosen indexes).
