# SoCal Swordfight Rules Helper — venue kiosk (Ollama + Open WebUI)

The authoritative version: runs locally on a laptop with the **complete,
verbatim** 2026 ruleset (all 13 official documents, ~30k tokens) as its
knowledge source — no summarizing, no compromises. This is what should be
running at the SoCal Swordfight info table. It needs no internet at all
once set up. For the free, install-nothing web version people can use from
home beforehand, see `../web/`.

## One-time setup (do this before the event, on the laptop that will run the kiosk)

1. **Install Ollama**: https://ollama.com/download (Mac/Windows/Linux).
2. **Build the rules-aware model**:
   ```
   cd kiosk
   ./build-model.sh
   ```
   This pulls a base model (`llama3.1:8b` by default) and bakes the full
   ruleset in as its system prompt, producing a model called
   `swordfight-rules`. On a weaker laptop, use a smaller base model instead:
   ```
   ./build-model.sh llama3.2:3b
   ```
   (or `llama3.2:1b` for the lightest option — lower answer quality, but
   noticeably faster on old hardware).
3. **Install Open WebUI** (a free, point-and-click chat interface for
   Ollama models — this is what the non-technical volunteer actually uses
   on the day):
   ```
   docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway \
     -v open-webui:/app/backend/data --name open-webui \
     --restart always ghcr.io/open-webui/open-webui:main
   ```
   (Requires Docker Desktop. If Docker isn't available, Open WebUI also
   installs via `pip install open-webui && open-webui serve` — see
   https://docs.openwebui.com for current options.)
4. Open `http://localhost:3000`, create a local admin account (this stays
   on the laptop, no internet needed after Docker/pip install), and select
   **swordfight-rules** as the model in a new chat. Confirm it answers
   correctly and declines out-of-scope questions.
5. Optional but recommended for a walk-up kiosk: set the browser to open
   directly to that chat in full-screen/kiosk mode, so a volunteer never
   needs to touch a model picker or settings menu.

## Running on the day

Just have the laptop on, with Open WebUI already running (step 3 stays up
in the background) and the browser open to the chat. No internet needed —
everything (model + ruleset + interface) runs locally.

## Before the event: test on the actual hardware you'll use at the venue

- Confirm response speed is acceptable with a real conversation, on the
  actual laptop (not a faster dev machine) — the "Verification" section
  of the main plan covers this. If `llama3.1:8b` is too slow, drop to
  `llama3.2:3b` and rebuild.
- Confirm it stays grounded in the ruleset and doesn't answer from general
  HEMA knowledge when the ruleset doesn't cover something.

## Updating the rules (e.g. for a 2027 revision)

1. Save each updated rules page as a `.webarchive` (Safari: File > Save As
   > Web Archive) or plain `.html`.
2. Re-run the same extraction approach used to build `rules-full.txt` for
   2026: unpack each file (`.webarchive` is a binary plist with the page's
   HTML in `WebMainResource.WebResourceData`), isolate the
   `documentation-div` section, strip HTML tags down to plain text, and
   concatenate all documents into one file with clear `## Section` headers
   between them (matching the format already in `rules-full.txt`).
3. Replace `rules-full.txt` with the new version.
4. Re-run `./build-model.sh` to rebuild the `swordfight-rules` model with
   the updated content.
5. Also update `../web/rules-condensed.txt` (see that folder's README) —
   it's a separate, hand-summarized file and won't update automatically.
