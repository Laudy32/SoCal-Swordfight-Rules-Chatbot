# Notes for Claude

Rules chatbot for the SoCal Swordfight 2026 HEMA tournament. Answers must come only from the official ruleset.

## Working with the maintainer
- The maintainer is not technical. Anything they must do themselves (GitHub, Cloudflare, Google AI Studio) gets click-by-click instructions: where to go, which button, what they should see. Never assume they know terms like commit, deploy, repo, or API key.
- Commit and push directly to `main` — no branches or pull requests. Pushing `web/**` republishes the site via GitHub Pages.
- Settings that need the maintainer's own accounts (Cloudflare Worker deploy, `GEMINI_API_KEY` secret) can't be done by Claude; changes to `worker/worker.js` only take effect after they paste it into Cloudflare and click Deploy — say so whenever it changes.

## Layout
- `web/index.html` — chat page (GitHub Pages). `WORKER_URL` points at the Cloudflare Worker.
- `worker/worker.js` — Cloudflare Worker: holds the Gemini key, owns the system prompt (`GUARDRAILS`), fetches `kiosk/rules-full.txt` from raw.githubusercontent.com (cached ~1h), calls Gemini `generateContent`. Setup guide: `worker/README.md`.
- `kiosk/` — offline Ollama + Open WebUI version for the venue; `build-model.sh` bakes `rules-full.txt` + `guardrail-preamble.txt` into a model.
- `kiosk/rules-full.txt` — single source of truth for the ruleset (13 official 2026 documents extracted from hemascorecard.com, including staff judge/director material). Both web and kiosk read it.

## Abuse protection
- Cloudflare D1 database `socal-swordfight-rules-limits` (id 8ea9ed3b-6670-41db-9ddb-fd6fc47f4695, table `rate_limits(key, count, expires_at)`), bound to the Worker as `LIMITS_DB`. Limits in `LIMITS` in worker.js; keys are HMAC-scrambled device IDs / IPs. Fails open if the DB errors.
- Cloudflare Turnstile: page constant `TURNSTILE_SITE_KEY`, Worker secret `TURNSTILE_SECRET_KEY`. Both optional; each is enforced only when set.
- The Cloudflare connector (when enabled in a session) can read deployed Worker code and query D1, but can't deploy code or set secrets/bindings — those stay manual for the maintainer.

## History worth knowing
- The web version originally ran WebLLM in-browser; its 4,096-token context forced a hand-written summary and the 1-3B models made real mistakes (invented point values, mixed up sparring "cuts" with Cutting Tournament cuts, over-refused, failed to add the +1 Bound Action bonus). It was replaced by the Worker + Gemini with the full verbatim ruleset. Recheck those failure cases after any prompt change.
- hemascorecard.com and github.io are blocked by the Claude sandbox network policy; the Gemini API and raw.githubusercontent.com are reachable.
