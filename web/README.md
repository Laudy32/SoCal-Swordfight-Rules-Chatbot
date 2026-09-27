# SoCal Swordfight Rules Helper — web page

A single static page (`index.html`) with a chat box. It sends each question to
the answer service in `../worker/` (a free Cloudflare Worker), which asks Google
Gemini to answer from the **complete, word-for-word 2026 ruleset**
(`../kiosk/rules-full.txt`). Published for free with GitHub Pages; the only
setting on the page is `WORKER_URL` — see `../worker/README.md` for setup.

## Why it works this way
The first version ran a small AI model inside the browser (WebLLM). Those
models are limited to about 4,000 tokens of context, so they could only see a
hand-written summary of the ~30,000-token ruleset — and at 1-3 billion
parameters they made real mistakes in testing: inventing point values,
confusing sparring "cuts" with Cutting Tournament cuts, refusing questions the
rules clearly answer, and failing to add a Bound Action bonus to a base score.
Gemini's context window fits the entire verbatim ruleset with plenty of room,
and it's a far more capable model, which fixes all of those at the source.

Trade-offs of this approach:
- **Needs internet** to answer (only a small question/answer is sent, so weak
  WiFi is usually fine). The kiosk (`../kiosk/`) remains the offline option.
- **Free-tier limits** on Gemini cap how many questions can be answered per day.
- **Privacy:** questions go to Google. The page says so.
- In exchange: works in any modern browser on any device (no WebGPU, no model
  download), and follow-up questions work because recent conversation is sent along.

## Running locally
Serve this folder over HTTP and open it:
```
cd web
python3 -m http.server 8000
```
Then open `http://localhost:8000`. `localhost:8000` is already allowed by the
Worker, so this works against the deployed Worker once `WORKER_URL` is set.

## Updating the rules
Nothing to change here — replace `../kiosk/rules-full.txt` and the Worker picks
it up within about an hour.
