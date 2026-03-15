import { assertEnv, getEnv } from "./env.js";

const sentenceSchema = {
  type: "object",
  properties: {
    sourceTitle: {
      type: "string",
      description: "Short source title for the imported video.",
    },
    sentences: {
      type: "array",
      items: {
        type: "object",
        properties: {
          english: { type: "string", description: "Reusable English sentence." },
          korean: { type: "string", description: "Natural Korean translation." },
          pattern: { type: "string", description: "Short grammar or phrase pattern label." },
          reason: { type: "string", description: "Why this sentence is worth remembering, in Korean." },
          example: { type: "string", description: "A new English example using the same pattern." },
          cloze: { type: "string", description: "Fill-in-the-blank version with ____ placeholder." },
          choices: {
            type: "array",
            items: { type: "string" },
            description: "Three answer choices including the correct answer.",
          },
          answer: { type: "string", description: "Correct answer for the cloze." },
        },
        required: ["english", "korean", "pattern", "reason", "example", "cloze", "choices", "answer"],
      },
    },
  },
  required: ["sourceTitle", "sentences"],
};

export async function generateLearningPack({ url, transcriptText }) {
  assertEnv();

  const { geminiApiKey, geminiModel } = getEnv();

  const prompt = [
    "You are creating reusable English study cards for a Korean learner.",
    "Given a YouTube transcript, choose 6 to 8 sentences that are self-contained, natural, and reusable in real speaking or writing.",
    "Avoid greetings, sponsor lines, fragments, and proper-noun-heavy lines.",
    "For each selected sentence:",
    "- keep the English sentence concise and natural",
    "- provide a natural Korean translation",
    "- provide a short pattern label",
    "- explain in Korean why the sentence is valuable",
    "- create a new English example using the same pattern",
    "- create one fill-in-the-blank cloze with ____",
    "- provide exactly three choices including the correct answer",
    "- ensure the answer appears in the choices",
    "",
    `Source URL: ${url}`,
    "",
    "Transcript:",
    transcriptText,
  ].join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": geminiApiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
          responseJsonSchema: sentenceSchema,
        },
      }),
    }
  );

  if (!response.ok) {
    const failure = await response.text();
    throw new Error(`Gemini request failed: ${failure}`);
  }

  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini did not return structured sentence data.");
  }

  const parsed = JSON.parse(text);
  const sentences = sanitizeSentences(parsed.sentences || []);

  if (!sentences.length) {
    throw new Error("Gemini returned no usable sentences.");
  }

  return {
    sourceTitle: parsed.sourceTitle || "Imported YouTube Video",
    sentences,
  };
}

function sanitizeSentences(items) {
  const unique = new Map();

  items.forEach((item) => {
    const english = normalizeText(item.english);
    const korean = normalizeText(item.korean);
    const answer = normalizeText(item.answer);
    const cloze = normalizeText(item.cloze);

    if (!english || !korean || !answer) {
      return;
    }

    const key = english.toLowerCase();
    if (unique.has(key)) {
      return;
    }

    const choices = Array.from(
      new Set((item.choices || []).map((choice) => normalizeText(choice)).filter(Boolean))
    );

    if (!choices.includes(answer)) {
      choices.unshift(answer);
    }

    unique.set(key, {
      english,
      korean,
      pattern: normalizeText(item.pattern) || "Reusable pattern",
      reason: normalizeText(item.reason) || "반복해서 다시 쓰기 좋은 문장입니다.",
      example: normalizeText(item.example) || english,
      cloze: cloze.includes("____") ? cloze : buildClozeFromEnglish(english, answer),
      choices: choices.slice(0, 3),
      answer,
    });
  });

  return Array.from(unique.values()).slice(0, 8);
}

function buildClozeFromEnglish(english, answer) {
  const escaped = escapeRegExp(answer);
  const pattern = new RegExp(`\\b${escaped}\\b`, "i");

  if (pattern.test(english)) {
    return english.replace(pattern, "____");
  }

  return `${english} (____)`;
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
