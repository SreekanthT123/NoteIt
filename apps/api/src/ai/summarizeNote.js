// src/ai/summarizeNote.js
import client from "./openaiClient.js";
import { checkAndUpdateUsage } from "../utils/aiUsage.js";

export const summarizeNote = async (content, user) => {
  await checkAndUpdateUsage(user);
  return retry(async () => {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `
You are an AI assistant.

Return STRICT JSON ONLY (no markdown, no explanation):

{
  "summary": "max 2 sentences",
  "tags": ["3-5 tags"]
}
`,
        },
        { role: "user", content },
      ],
    });

    return validateSummary(safeParse(response.choices[0].message.content));
  });
};

function validateSummary(result) {
  if (!result || typeof result.summary !== "string") {
    throw new Error("Invalid AI response");
  }
  return result;
}

function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("AI JSON parse failed:", text);

    return {
      summary: "AI failed to generate summary",
      tags: [],
    };
  }
}

function withTimeout(promise, ms = 5000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI timeout")), ms),
    ),
  ]);
}

async function retry(fn, retries = 2) {
  try {
    return await fn();
  } catch (err) {
    if (retries === 0) throw err;
    console.warn("Retrying AI...");
    return retry(fn, retries - 1);
  }
}
