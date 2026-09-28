// SoCal Swordfight Rules Helper — Cloudflare Worker.
// Receives a question from the web page, sends it to Google Gemini together with
// the full official ruleset, and returns the answer. The Gemini API key lives only
// here (as the GEMINI_API_KEY secret), never in the public web page.

// ---- Settings you may need to change ----------------------------------------
// Preferred Gemini model. If Google retires it, the Worker switches to another
// available Flash model by itself (see pickReplacementModel).
const MODEL = "gemini-flash-latest";
const RULES_URL =
  "https://raw.githubusercontent.com/Laudy32/SoCal-Swordfight-Rules-Chatbot/main/kiosk/rules-full.txt";
const ALLOWED_ORIGINS = [
  "https://laudy32.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
];
// -----------------------------------------------------------------------------

const RULES_CACHE_SECONDS = 3600;
const MAX_QUESTION_CHARS = 500;
const MAX_HISTORY_TURNS = 6;
const MAX_HISTORY_TURN_CHARS = 2000;
const TRANSIENT_STATUSES = [500, 502, 503, 504];
const RETRY_DELAYS_MS = [1000, 2500];

const GUARDRAILS = `You answer questions about the SoCal Swordfight 2026 HEMA tournament rules for participants.

- Answer using ONLY the official ruleset below. Do not use outside knowledge about HEMA, fencing, or other events' rules.
- When the ruleset states the answer, give it directly and confidently, even if the question is worded differently from the text. Combine stated values when a question needs it (for example, a longsword hit's base points plus the Bound Action bonus).
- If the ruleset doesn't cover it, say so plainly and suggest asking a tournament director or staff member. Never invent point values, rules, or specifics.
- "Cut" means different things in different sections: a scoring action in the sparring tournaments (longsword, rapier, saber, etc.) versus a judged attempt on a tatami or paper target in the separate Cutting Tournaments. Use the section that matches the question; if it's unclear which the person means, say how the answer differs or ask.
- If the question doesn't say which tournament or weapon, answer for the most likely one and mention if it differs elsewhere.
- Sections marked STAFF REFERENCE are written for judges and directors; you may use them to explain how judging works.
- If asked how to cheat, break the rules, or gain an unfair advantage, decline and note that the event expects fair play, good sportsmanship, and following staff instructions.
- For safety concerns, disputed calls, or equipment approval, point the person to tournament staff even when the ruleset has relevant text.
- Keep answers short: a few sentences or a brief list. Plain text only, no markdown formatting.

--- OFFICIAL RULESET ---
`;

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

let rulesCache = { text: null, fetchedAt: 0 };
let activeModel = MODEL;

async function loadRules() {
  const now = Date.now();
  if (rulesCache.text && now - rulesCache.fetchedAt < RULES_CACHE_SECONDS * 1000) {
    return rulesCache.text;
  }
  const res = await fetch(RULES_URL, { cf: { cacheTtl: RULES_CACHE_SECONDS } });
  if (!res.ok) throw new Error(`Rules fetch failed: HTTP ${res.status}`);
  const text = await res.text();
  if (!text.trim()) throw new Error("Rules file is empty");
  rulesCache = { text, fetchedAt: now };
  return text;
}

async function listFlashModels(apiKey) {
  const res = await fetch(`${GEMINI_BASE}/models?pageSize=1000`, {
    headers: { "x-goog-api-key": apiKey },
  });
  if (!res.ok) throw new Error(`Model list failed: HTTP ${res.status}`);
  const data = await res.json();
  const flash = (data.models || [])
    .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
    .map((m) => String(m.name || "").replace(/^models\//, ""))
    .filter((name) => /flash/i.test(name) && !/lite|tts|image|live|audio|embed/i.test(name));
  const stable = flash.filter((name) => !/preview|exp/i.test(name));
  return stable.length ? stable : flash;
}

function pickReplacementModel(names, exclude) {
  const options = names.filter((name) => name !== exclude);
  const latestAlias = options.find((name) => name.endsWith("-latest"));
  if (latestAlias) return latestAlias;
  const version = (name) => parseFloat((name.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || "0");
  options.sort((a, b) => version(b) - version(a) || a.length - b.length);
  return options[0] || null;
}

function callGemini(model, apiKey, payload) {
  return fetch(`${GEMINI_BASE}/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(payload),
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Google's free tier is sometimes briefly overloaded; wait and try again before giving up.
async function callGeminiWithRetry(model, apiKey, payload) {
  let res = await callGemini(model, apiKey, payload);
  for (const delay of RETRY_DELAYS_MS) {
    if (!TRANSIENT_STATUSES.includes(res.status)) break;
    const errText = await res.text().catch(() => "");
    console.log(`Gemini ${res.status} on "${model}", retrying in ${delay}ms:`, errText.slice(0, 200));
    await sleep(delay);
    res = await callGemini(model, apiKey, payload);
  }
  return res;
}

function googleDetail(status, model, bodyText) {
  let message = bodyText;
  try {
    message = JSON.parse(bodyText).error?.message || bodyText;
  } catch {}
  return `Google ${status} (${model}): ${String(message).replace(/\s+/g, " ").slice(0, 150)}`;
}

function corsHeaders(origin) {
  const headers = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

function cleanHistory(history) {
  if (!Array.isArray(history)) return [];
  const turns = history
    .filter(
      (t) =>
        t &&
        (t.role === "user" || t.role === "assistant") &&
        typeof t.text === "string" &&
        t.text.trim(),
    )
    .slice(-MAX_HISTORY_TURNS)
    .map((t) => ({
      role: t.role === "assistant" ? "model" : "user",
      parts: [{ text: t.text.slice(0, MAX_HISTORY_TURN_CHARS) }],
    }));
  while (turns.length && turns[0].role !== "user") turns.shift();
  return turns;
}

function explainGeminiError(status, bodyText) {
  if (status === 429) {
    return {
      status: 429,
      error: "The rules helper has hit its free usage limit for now. Please try again later, or ask tournament staff.",
    };
  }
  if (status === 404) {
    return {
      status: 502,
      error: `Setup problem: the AI model "${activeModel}" isn't available and no replacement was found. Please let tournament staff know.`,
    };
  }
  if (status === 400 && /API key/i.test(bodyText)) {
    return {
      status: 502,
      error: "Setup problem: the AI service key isn't valid. Please let tournament staff know.",
    };
  }
  if (status === 401 || status === 403) {
    return {
      status: 502,
      error: "Setup problem: the AI service rejected this helper's key. Please let tournament staff know.",
    };
  }
  return {
    status: 502,
    error: "The AI service had a problem answering. Please try again in a moment.",
  };
}

async function handleHealth(env, origin) {
  let rules = { ok: false };
  try {
    const text = await loadRules();
    rules = { ok: true, characters: text.length };
  } catch (err) {
    rules = { ok: false, error: err.message };
  }
  const model = { preferred: MODEL, inUse: activeModel };
  if (env.GEMINI_API_KEY) {
    try {
      model.availableFlashModels = await listFlashModels(env.GEMINI_API_KEY);
    } catch (err) {
      model.availableFlashModels = { error: err.message };
    }
  }
  return json(
    {
      status: "ok",
      message: "SoCal Swordfight rules helper is running. The web page sends questions here with POST.",
      apiKeyConfigured: Boolean(env.GEMINI_API_KEY),
      rules,
      model,
    },
    200,
    origin,
  );
}

async function handleAsk(request, env, origin) {
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    return json({ error: "Requests are only accepted from the SoCal Swordfight rules page." }, 403, origin);
  }
  if (!env.GEMINI_API_KEY) {
    return json({ error: "Setup problem: no AI service key configured. Please let tournament staff know." }, 500, origin);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400, origin);
  }
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (!question) return json({ error: "Please type a question." }, 400, origin);
  if (question.length > MAX_QUESTION_CHARS) {
    return json({ error: `Please keep questions under ${MAX_QUESTION_CHARS} characters.` }, 400, origin);
  }

  let rules;
  try {
    rules = await loadRules();
  } catch (err) {
    console.log("Rules load error:", err.message);
    return json({ error: "Couldn't load the ruleset right now. Please try again in a moment." }, 502, origin);
  }

  const contents = [...cleanHistory(body.history), { role: "user", parts: [{ text: question }] }];

  const payload = {
    systemInstruction: { parts: [{ text: GUARDRAILS + rules }] },
    contents,
    generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
  };
  let usedModel = activeModel;
  let geminiRes = await callGeminiWithRetry(usedModel, env.GEMINI_API_KEY, payload);

  if (geminiRes.status === 404) {
    const unavailable = activeModel;
    try {
      const replacement = pickReplacementModel(await listFlashModels(env.GEMINI_API_KEY), unavailable);
      if (replacement) {
        console.log(`Model "${unavailable}" unavailable; switching to "${replacement}"`);
        activeModel = replacement;
        usedModel = replacement;
        geminiRes = await callGeminiWithRetry(usedModel, env.GEMINI_API_KEY, payload);
      }
    } catch (err) {
      console.log("Replacement model lookup failed:", err.message);
    }
  }

  if (TRANSIENT_STATUSES.includes(geminiRes.status)) {
    // Still failing after retries: try a different Flash model once, without switching permanently.
    try {
      const alternative = pickReplacementModel(await listFlashModels(env.GEMINI_API_KEY), usedModel);
      if (alternative) {
        console.log(`Model "${usedModel}" still failing (${geminiRes.status}); trying "${alternative}" once`);
        usedModel = alternative;
        geminiRes = await callGemini(usedModel, env.GEMINI_API_KEY, payload);
      }
    } catch (err) {
      console.log("Alternative model lookup failed:", err.message);
    }
  }

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    console.log(`Gemini error ${geminiRes.status}:`, errText.slice(0, 500));
    const { status, error } = explainGeminiError(geminiRes.status, errText);
    return json({ error, detail: googleDetail(geminiRes.status, usedModel, errText) }, status, origin);
  }

  const data = await geminiRes.json();
  const candidate = data.candidates?.[0];
  const answer = (candidate?.content?.parts || [])
    .filter((p) => typeof p.text === "string" && !p.thought)
    .map((p) => p.text)
    .join("")
    .trim();

  if (!answer) {
    console.log("Empty answer:", JSON.stringify({ promptFeedback: data.promptFeedback, finishReason: candidate?.finishReason }));
    const reason = data.promptFeedback?.blockReason || candidate?.finishReason || "empty response";
    return json(
      { error: "No answer came back for that one. Try rephrasing, or ask tournament staff.", detail: `Google (${usedModel}): ${reason}` },
      502,
      origin,
    );
  }
  return json({ answer }, 200, origin);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method === "GET") return handleHealth(env, origin);
    if (request.method === "POST") {
      try {
        return await handleAsk(request, env, origin);
      } catch (err) {
        console.log("Unexpected error:", err.stack || err.message);
        return json(
          { error: "Something went wrong. Please try again in a moment.", detail: String(err.message).slice(0, 150) },
          500,
          origin,
        );
      }
    }
    return json({ error: "Method not allowed." }, 405, origin);
  },
};
