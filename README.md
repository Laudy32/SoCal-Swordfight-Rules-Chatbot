# SoCal Swordfight 2026 Rules Helper

**Asked to test this out? Start here → [`HOW_TO_TEST.md`](./HOW_TO_TEST.md)**
(step-by-step, no GitHub or Terminal experience needed)

A chatbot that answers questions using only the official SoCal Swordfight
ruleset — no general knowledge, free to run, works with no internet at the
venue. Two pieces, covering the two situations this needs to work in:

- **`web/`** — a static webpage running a small LLM entirely in the visitor's
  browser (no server, no install). Free to host, works offline after first
  load. Uses a condensed rules summary, because in-browser models are
  limited to a 4,096-token context window. Meant for casual questions from
  home before the tournament.
- **`kiosk/`** — Ollama + Open WebUI running on a laptop at the venue, with
  the complete, verbatim ruleset (no summarizing) as its knowledge source.
  No context-size constraint here, so nothing is trimmed. This is the
  authoritative version — what should be running at the info table.

See each folder's README for setup and how to update the rules for a future
year's ruleset.

Both pieces share the same design: the LLM is told to answer only from the
provided ruleset text and to say "ask a tournament official" rather than
guess when something isn't covered — see the system prompt in `web/index.html`
and `kiosk/guardrail-preamble.txt`.

Full background and the reasoning behind this design is in the project plan.
