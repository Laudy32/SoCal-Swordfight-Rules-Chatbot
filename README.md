# SoCal Swordfight 2026 Rules Helper

**Asked to test this out? Start here → [`HOW_TO_TEST.md`](./HOW_TO_TEST.md)**
(step-by-step, no GitHub or Terminal experience needed)

A chatbot that answers questions using only the official SoCal Swordfight
ruleset — free to run, with an offline option for the venue. Three pieces:

- **`web/`** — the chat page participants use (published free on GitHub Pages).
  Works in any modern browser; needs internet.
- **`worker/`** — the free Cloudflare Worker the page talks to. It sends each
  question plus the complete, verbatim ruleset to Google Gemini's free tier and
  returns the answer, keeping the API key out of the public page.
  **One-time setup instructions: [`worker/README.md`](./worker/README.md).**
- **`kiosk/`** — Ollama + Open WebUI on a laptop at the venue info table, with
  the same complete ruleset, running fully offline.

Both the web answers and the kiosk read the same file, `kiosk/rules-full.txt`
(all 13 official 2026 documents, including staff judging/directing material).
Updating the rules for a new year means replacing that one file and rebuilding
the kiosk model — the web version picks it up automatically.

Both are instructed to answer only from the ruleset, say so and point to
tournament staff when something isn't covered, and decline "how do I cheat"
style questions — see `GUARDRAILS` in `worker/worker.js` and
`kiosk/guardrail-preamble.txt`.
