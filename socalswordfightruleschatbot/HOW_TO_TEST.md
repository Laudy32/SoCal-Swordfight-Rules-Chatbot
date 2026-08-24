# How to Test the SoCal Swordfight Rules Chatbot

Thanks for helping test this! This document assumes you've never used GitHub
or a computer's Terminal before.

There are **two separate things** you might be asked to test. Most people
will only need **Part 1**, and it's just clicking a link.

- **Part 1 — The Chat Webpage**: what a participant would use from home on
  their phone/computer before the tournament. If someone just said "can you
  try out the rules chatbot," this is what they mean.
- **Part 2 — The Info Table Kiosk**: the laptop that will sit at the actual
  tournament info table. Only relevant if you were specifically asked to
  test that laptop setup, or you're the person configuring it before the
  event.

---

## Part 1 — The Chat Webpage

### What you'll need
- A computer, iPhone, or iPad.
- One of these web browsers, reasonably up to date:
  - **Chrome** or **Microsoft Edge** — recommended, works on any Windows/Mac/Android device.
  - **Safari** — only on **iOS 18 / iPadOS 18 / macOS Sequoia or newer**. If unsure, check Settings → General → About → Software Version.
  - Firefox isn't supported yet — use Chrome/Edge/Safari instead.
- That's it. No download, no install, no account, no Terminal.

### Steps
1. Open this link: **`https://laudy32.github.io/SoCal-Swordfight-Rules-Chatbot/`**
2. The first time, it downloads a small AI model in the background (a progress message shows this) — usually under a minute. This only happens once; after that it works instantly, even with no internet.
3. Once it says **"Ready — ask a question below,"** type a question and press **Ask**.

### What to try
- A few real rules questions, e.g.:
  - "What gear do I need for longsword?"
  - "What counts as a double hit?"
  - "Can I bring my own smallsword?"
  - "What's the point cap for a match?"
- Something **not** covered by the rules (e.g. "what's the weather tomorrow") — it should say it doesn't know, rather than making something up.
- Turning off your WiFi/data after it's loaded once, then reloading the page — it should still work.

### What to report back
- Your device and browser (e.g. "iPhone 13, Safari").
- Whether it loaded and answered correctly.
- Anything wrong, slow, or confusing — screenshots help.

<details>
<summary>Advanced: running it from a downloaded copy instead of the link (only if asked to)</summary>

If you're specifically testing a not-yet-published version of the page rather
than the live link above, see the "Running locally" section in
`web/README.md` — that path needs a Terminal command and is
meant for the person building the page, not general testers.

</details>

---

## Part 2 — The Info Table Kiosk

This one's different: it needs a one-time setup on the specific laptop that
will be used at the venue, done in advance by whoever is preparing that
laptop (this can be technical — that's expected). Once that setup is done,
the volunteer working the table on the actual day does **not** need to do
anything technical at all — they just open the laptop to a browser page
that's already sitting there ready to use, the same as opening any app.

**If you're the volunteer testing the finished table setup:** just open the
laptop, make sure the browser is on the rules-chat page, and try asking
questions — same list as Part 1 above. Nothing to install, nothing to type
in a Terminal. If it's not already set up that way, let whoever gave you the
laptop know before the event, not on the day.

**If you're the person doing the advance setup on the kiosk laptop:** full
instructions are in `kiosk/README.md`, including setting the
browser to open directly to the chat so the volunteer never has to touch a
model picker, a terminal, or any settings.

### What to report back (setup testers)
- Whether the browser opens straight to a working chat with no extra steps.
- Response speed on the actual kiosk laptop.
- Anything that would confuse someone who's never seen this before.
