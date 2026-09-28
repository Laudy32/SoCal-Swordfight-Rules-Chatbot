# Setting up the Rules Helper's answer service

**Who this is for:** the one person setting the chatbot up, once, before it's
shared. Everyone else just uses the web page and never needs any of this.

**Time:** about 30 minutes. **Cost:** free. **Needed:** a computer with a web
browser. No Terminal, no software to install.

## What you're setting up, in plain terms

The chat web page can't answer questions by itself. Behind the scenes, three
things work together:

1. **The web page** (on GitHub) — where people type questions.
2. **A small "middleman" program called a Worker** (on Cloudflare, a free web
   service) — it receives each question, attaches the full rulebook, and
   passes it on.
3. **Google Gemini** (Google's AI) — reads the rulebook and writes the answer.

Gemini needs a password-like code called an **API key** to know the requests are
allowed. The Worker holds that key privately, so it never appears on the public
web page. That's the whole reason the Worker exists.

You'll create two free accounts (Google AI Studio, Cloudflare), copy some text
between them, and change one line on GitHub.

## Words you'll see
- **API key** — a long code that works like a password for Google's AI. Treat it like a password: don't post it or share it.
- **Worker** — the small middleman program described above.
- **Deploy** — Cloudflare's word for "save and switch on."
- **Repository** (or **repo**) — a project's home on GitHub. This one is at `github.com/Laudy32/SoCal-Swordfight-Rules-Chatbot`.
- **Commit** — GitHub's word for "save this change."

---

## Part 1 — Get a free Gemini API key from Google

1. Open a new browser tab and go to **aistudio.google.com**.
2. Sign in with a Google account (the same kind you'd use for Gmail). If you don't have one, the page offers to create one.
3. If it asks you to accept terms of service, read and accept them.
4. Look for a button or link that says **Get API key** (usually in the left sidebar or at the top of the page) and click it.
5. Click **Create API key**. If it asks you to choose a "project," choose the default it suggests, or click **Create API key in new project**.
6. A long code appears (letters and numbers, often starting with `AIza`). Click the **copy** icon next to it.
7. Open a text note on your computer (Notes on Mac, Notepad on Windows) and paste the key there for now. You'll need it in Part 3.
8. **Important:** if Google ever offers to "set up billing" or "upgrade" for this key, say no. Without billing, the key stays on the free plan. The worst that can happen is it stops answering for the rest of the day if lots of people use it — it can never charge you money.
9. Optional but useful: see **Free usage limits** under "Good to know" at the end of this guide for how to check how many questions a day the free plan allows.

You can close this tab.

## Part 2 — Create the Worker on Cloudflare

### 2a. Get a copy of the Worker's code
1. Go to **github.com/Laudy32/SoCal-Swordfight-Rules-Chatbot**.
2. In the list of folders and files, click the folder named **worker**.
3. Click the file named **worker.js**. Its contents appear on screen.
4. Near the top right of the file's contents, find the **Copy raw file** button (an icon of two overlapping squares — hovering over it shows the name) and click it. The whole file is now copied.
5. Leave this tab open.

### 2b. Create a free Cloudflare account
1. Open a new tab and go to **dash.cloudflare.com**.
2. Click **Sign up**, enter an email address and a password, and follow the instructions (you may need to confirm your email by clicking a link Cloudflare sends you).
3. If Cloudflare asks what you want to do or offers to "add a website/domain," skip that — you don't need a website of your own.

### 2c. Create the Worker
1. In Cloudflare's left-hand menu, click **Workers & Pages**. (If you don't see it, it may be inside a section called **Compute** — click that first.)
2. Click the **Create** button (sometimes **Create application**).
3. Choose **Create Worker** or **Start with Hello World!** — whichever is offered. It's a sample to replace.
4. There's a box to name the Worker. Type: `socal-swordfight-rules`
5. Click **Deploy**. Cloudflare creates a sample Worker.
6. Click **Edit code** (sometimes **Continue to project**, then **Edit code**). A code editor opens, with some sample code in it.
7. Click inside the code area. Select all of it — on Mac press **⌘ Command + A**, on Windows press **Ctrl + A**. Delete it with the Delete/Backspace key. The code area should now be empty.
8. Paste the code you copied in step 2a — on Mac **⌘ Command + V**, on Windows **Ctrl + V**. The first line should start with `// SoCal Swordfight Rules Helper`.
9. Click **Deploy** (usually at the top right). Confirm if it asks.
10. Find your Worker's web address — shown near the top of the editor or on the Worker's main page. It looks like
    `https://socal-swordfight-rules.YOUR-NAME.workers.dev`
    (with your own account name instead of `YOUR-NAME`). Copy it and paste it into your text note next to the API key. You'll need it in Part 5.

## Part 3 — Give the Worker your API key

1. Go back to the Worker's main page in Cloudflare (click the Worker's name, `socal-swordfight-rules`, at the top of the editor, or find it again under **Workers & Pages**).
2. Click the **Settings** tab.
3. Find the section called **Variables and Secrets** and click **Add** (or **+ Add**).
4. For **Type**, choose **Secret** (not "Text"). This keeps the key hidden, even from you, once saved.
5. For **Variable name**, type exactly: `GEMINI_API_KEY` (capital letters, with underscores, no spaces).
6. For **Value**, paste your API key from the text note (from Part 1).
7. Click **Deploy** (or **Save**).

## Part 4 — Check the Worker is working

1. Open a new browser tab. Paste your Worker's web address (from Part 2, step 10) into the address bar and press Enter.
2. You'll see a short block of text, not a normal web page. That's expected. Check two things in it:
   - It contains `"apiKeyConfigured":true`
   - It contains `"rules":{"ok":true`
3. If both are there, the Worker is ready. Go to Part 5. (You'll also see a `"model"` section listing the Google AI models the Worker can use. You don't need to do anything with it — it's there to help diagnose problems.)
   - If it says `"apiKeyConfigured":false` — redo Part 3, and check the name is exactly `GEMINI_API_KEY`.
   - If it says `"rules":{"ok":false` — something is wrong with the rulebook file in the GitHub repo. Check that `kiosk/rules-full.txt` still exists there.
   - If the page doesn't load at all — double-check the address was copied exactly.

## Part 5 — Connect the web page to the Worker

1. Go to **github.com/Laudy32/SoCal-Swordfight-Rules-Chatbot** and make sure you're signed in to GitHub.
2. Click the folder **web**, then click the file **index.html**.
3. Near the top right of the file's contents, click the **pencil icon** (hovering over it says "Edit this file"). The file becomes editable.
4. Find this line — it's about two-thirds of the way down. To search, press **⌘ Command + F** (Mac) or **Ctrl + F** (Windows) and type `WORKER_URL`:
   ```
   const WORKER_URL = "";
   ```
5. Click between the two quote marks `""` and paste your Worker's address, so the line looks like:
   ```
   const WORKER_URL = "https://socal-swordfight-rules.YOUR-NAME.workers.dev";
   ```
   Be careful to keep both quote marks and the semicolon `;` at the end.
6. Click the green **Commit changes…** button (top right).
7. A box pops up. Leave the message as it is and click **Commit changes** in the box.
8. Wait about two minutes. GitHub republishes the web page automatically.

## Part 6 — Try it

1. Go to **laudy32.github.io/SoCal-Swordfight-Rules-Chatbot**
2. Type a question, such as "How many points is a cut to the head in longsword?", and click **Ask**. After a few seconds, an answer should appear (3 points).
3. For a fuller check, see `HOW_TO_TEST.md` in the repo.
4. If the page still says it "isn't connected to its answer service yet," wait another minute, then refresh the page. If it still says that, redo Part 5 and check the address is between the quote marks.

You can delete the text note now (or keep the API key somewhere safe, like a password manager).

---

## If something goes wrong later

The chat page shows a short message, with a small grey **Details** line under it. When asking someone for help, copy both — the Details line says what Google actually reported.

Common messages:
- **"The AI service had a problem answering"** — Google was briefly overloaded. The Worker already waits and retries a few times (and tries a second model) before showing this, so if it appears, try again in a minute.
- **"is getting a lot of questions right now"** — Google's free per-minute limit was reached on every model the Worker could use. Wait a minute and try again.
- **"has used up its free questions for today"** — every model's free daily allowance is used up. It resets by itself at midnight Pacific time. See **Free usage limits** below if this happens often.
- **"Setup problem: the AI model … isn't available and no replacement was found"** — normally you'll never see this: when Google retires a model, the Worker automatically switches to another available Flash model. If it does appear, open the Worker's address in your browser (as in Part 4) and send the `"model"` section to whoever helps maintain the chatbot.
- **"Setup problem: the AI service key isn't valid"** or **"rejected this helper's key"** — make a new key (Part 1) and put it in the Worker (Part 3; edit the existing `GEMINI_API_KEY` entry instead of adding a new one).
- **"Requests are only accepted from the SoCal Swordfight rules page"** — the web page's address changed. Ask someone comfortable editing code to add the new address to the `ALLOWED_ORIGINS` list near the top of `worker.js`.

Cloudflare's **Logs** tab on the Worker's page shows technical details, useful if you ask someone else for help.

## Good to know
- **Free usage limits:** Google gives each of its AI models a separate free allowance — a number of requests per minute and per day. Every question uses one request (plus a few extra if Google is briefly overloaded). When one model's allowance runs out, the Worker automatically moves on to Google's other Flash models, then to the "Flash-Lite" models (still reading the full rulebook, slightly less capable), so the day's total is the sum across models. To see the real numbers:
  1. Go to **ai.dev/usage?tab=rate-limit** and sign in with the same Google account you used in Part 1.
  2. The page lists each model with its limits: **RPM** (requests per minute) and **RPD** (requests per day). Add up the RPD numbers for the models with "flash" in the name — that's roughly how many questions the chatbot can answer per day.
  If that isn't enough for the tournament, the fix is Google's paid plan with a spending limit set. That costs real money, so it's a decision for the organizers — ask whoever maintains the chatbot to work out the likely cost first.
- **Privacy:** questions people type are sent to Google to be answered, and Google may use free-plan requests to improve its products. The chat page says this and asks people not to type personal information.
- **Misuse:** the Worker only accepts questions from the rules page and only answers rules questions, so it's not useful to anyone as a general free chatbot. The worst case from misuse is using up the day's free allowance — never a bill, as long as billing stays off (Part 1, step 8).
- **New rules next year:** replace `kiosk/rules-full.txt` in the repo with the new rulebook. The Worker picks up the new text by itself within about an hour — nothing to change here.
- **Internet needed:** only the short question and answer travel over the phone's connection (the big rulebook goes from Cloudflare to Google), so weak WiFi usually works. For a fully offline option at the venue, see the kiosk setup in `kiosk/README.md`.
