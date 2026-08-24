# SoCal Swordfight Rules Helper — web (in-browser) version

A single static page that answers rules questions using a small LLM running
entirely inside the visitor's browser (via [WebLLM](https://github.com/mlc-ai/web-llm)
+ WebGPU). No server, no backend, no API costs. Meant for casual pre-tournament
questions from home — for the authoritative, complete ruleset used at the
venue, see `../kiosk/`.

## Why this version uses a *condensed* ruleset

Every prebuilt WebLLM model caps its context window at 4,096 tokens. The full
2026 ruleset is about 30,000 tokens — far too big to fit. `rules-condensed.txt`
is a manually-written summary (~3,300 tokens) covering all 13 official
documents, trimmed to fit comfortably alongside the guardrail instructions and
a response. It intentionally leaves out the most granular material (exact
cutting-tournament choreography per tier, judge hand-signal mechanics) — the
page tells users to ask a director for anything not covered.

Because the budget is tight, each question is answered independently (no
multi-turn memory) — see the `stream: true` chat call in `index.html`, which
always sends just the system prompt + the current question.

## Running locally

Must be served over HTTP (not opened as a `file://` path) — both ES module
imports and WebGPU require it:

```
cd web
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a WebGPU-capable browser (recent Chrome,
Edge, or Safari 18+). First load downloads the model (~700MB-1GB depending on
quantization) and caches it in the browser; subsequent loads work offline.

## Deploying

Any static host works — GitHub Pages, Cloudflare Pages, Netlify. Just publish
this `web/` folder. The model itself is fetched by WebLLM from its own hosted
model library (Hugging Face), not from your host, so hosting stays cheap
regardless of model size.

## Updating the rules (e.g. for a 2027 revision)

1. Get the new ruleset text (see `../kiosk/README.md` for the extraction
   process used for the 2026 `.webarchive` pages).
2. Rewrite `rules-condensed.txt` as a summary that fits the same rough
   token budget (~3,000-3,500 tokens) — the guardrail system prompt in
   `index.html` doesn't need to change.
3. Redeploy the static files. No rebuild step required.

## Known limitations

- Requires WebGPU (recent Chrome/Edge, or Safari 18+ on iOS/iPadOS/macOS).
  Older devices/browsers see a fallback message pointing to the staffed
  venue kiosk instead.
- Content is a condensed summary, not the verbatim ruleset — flagged in the
  page header and in the model's own guardrail instructions.
- Small local models (1B params here) follow instructions less reliably than
  a large hosted model. Validate actual behavior in a real browser before
  relying on it (see the main plan's Verification section).
