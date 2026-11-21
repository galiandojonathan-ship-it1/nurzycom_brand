# Site dictionary (dict.js)

Select a word or a short phrase on a page with questions or texts, and a card shows its meaning at once. A course or test
word keeps its own card (gloss.js, «Словарь курса»); any other word comes from this dictionary.

- **Source:** English Wiktionary, extracted by kaikki.org (`kaikki.org-dictionary-English.jsonl.gz`). Wiktionary text is
  licensed **CC BY-SA 4.0**; the built files are a derived work under the same licence. The card credits «Wiktionary,
  CC BY-SA 4.0»; keep that line if the card changes.
- **What is kept** (`build_dict.py`): English words with a wordfreq Zipf from 1.5 to 5.3 (very common words a B2 student
  knows and very rare ones are left out), common short phrases (Zipf ≥ 3.2, up to 3 words); up to 2 senses per part of
  speech (glosses cut to 120 characters), up to 4 Russian equivalents without stress marks; obsolete, vulgar and similar
  senses skipped, archaic ones kept for SAT literary passages; irregular forms (went → go) as a small map, regular endings
  are handled in dict.js.
- **Files:** `docs/data/dict.json` names the build (`dir`, `parts`); `docs/q/dict/<build>/<two letters>.json.gz` holds the
  words that start with those letters (most are a few KB, 300 KB at most), so a lookup downloads one small file, cached
  for good (`/q/*` is immutable in `docs/_headers`). Not encrypted: it is a public dictionary, not course material.
- **Limit:** a dictionary does not know the context. It shows the first senses Wiktionary lists, which can be a rarer
  sense first (undermine: «to dig underneath»). Words marked in lessons still get a checked, in-context definition in
  the deck «VL · Слова с уроков».

Rebuild (about a minute; the 534 MB source is streamed, not stored; needs `pip install wordfreq`):

```bash
curl -s https://kaikki.org/dictionary/English/kaikki.org-dictionary-English.jsonl.gz | gunzip | python3 -I tools/dict/build_dict.py docs
```

It replaces `docs/q/dict/` with a new build name and rewrites `docs/data/dict.json`.
