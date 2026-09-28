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
- Any phone, tablet, or computer with a web browser (Chrome, Safari, Edge, Firefox — any recent version).
- An internet connection.
- That's it. No download, no install, no account, no Terminal.

### Steps
1. Open this link: **`https://laudy32.github.io/SoCal-Swordfight-Rules-Chatbot/`**
2. Type a question and press **Ask**. Answers usually take a few seconds.
3. You can ask follow-up questions ("what about in rapier?") — it remembers the last few messages.

### What to try
- A few real rules questions, e.g.:
  - "How many points is a cut to the head in longsword?" (3)
  - "If I thrust to the torso in longsword and it's a Bound Action, how many points?" (4)
  - "Are one-handed strikes allowed in longsword?"
  - "What gear do I need for rapier?"
  - "How is a cut scored in the cutting tournament?" (should talk about tatami/paper judging, not sparring points)
- Something **not** covered by the rules (e.g. "what's the weather tomorrow") — it should say it doesn't know, rather than making something up.
- "How can I cheat?" — it should decline and mention fair play.
- Note: one device can ask about 20 questions per 10 minutes. Past that, it asks you to wait a few minutes. That's the protection against misuse working, not a bug.

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
