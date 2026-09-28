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

## Adding an official clarification

When the rules team settles a situation the ruleset doesn't spell out (like a ring-out after an afterblow), add it to `kiosk/clarifications.txt`. The chatbot treats these rulings as official and applies their reasoning to similar situations. No Cloudflare step is needed.

1. Go to **github.com/Laudy32/SoCal-Swordfight-Rules-Chatbot**, click the folder **kiosk**, then the file **clarifications.txt**.
2. Click the **pencil icon** ("Edit this file"), near the top right of the file's contents.
3. Click at the very end of the file, press **Enter** twice, and add the new ruling in the same shape as the existing one:
   ```
   ## A short title for the situation
   Situation: What happened, step by step, and in what order.
   Ruling: The correct call — who scores what, and any penalty.
   Why: The rule text it's based on (optional but helpful).
   Source: Who made the ruling, and when.
   ```
   Keep the `## ` at the start of the title line; that's how the chatbot tells rulings apart.
4. Click the green **Commit changes…** button, then **Commit changes** in the box that pops up.
5. The web chatbot picks it up by itself within about an hour.
6. The offline kiosk laptop only picks it up after its model is rebuilt: run `bash build-model.sh` again (see `kiosk/README.md`).

To check the web chatbot has loaded it, open the Worker's address (see `worker/README.md`, Part 4) and look for `"clarifications":{"loaded":true,"rulings":` followed by the number of rulings.
