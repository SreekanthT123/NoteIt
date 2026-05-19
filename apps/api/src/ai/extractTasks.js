// export const extractTasks = async (content) => {
//   await new Promise((res) => setTimeout(res, 300));

//   const tasks = [];
//   const sentences = content.split(/and|,|\./i);

//   for (let s of sentences) {
//     const text = s.trim().toLowerCase();

//     if (!text) continue;

//     let title = null;
//     let dueAt = null;

//     // Detect actions
//     if (text.includes("call")) title = extractAction(text, "call");
//     else if (text.includes("buy")) title = extractAction(text, "buy");
//     else if (text.includes("submit")) title = extractAction(text, "submit");

//     // Detect dates
//     if (text.includes("tomorrow")) {
//       dueAt = getTomorrow();
//     } else if (text.includes("today")) {
//       dueAt = new Date();
//     }

//     if (text.includes("friday")) {
//       dueAt = getNextDay(5); // Friday
//     }

//     if (title) {
//       tasks.push({
//         title,
//         dueAt,
//         sourceText: s.trim(),
//       });
//     }
//   }

//   return tasks;
// };

// function extractAction(text, action) {
//   const idx = text.indexOf(action);
//   return text.slice(idx).replace(/tomorrow|today|friday/g, "").trim();
// }

// function getTomorrow() {
//   const t = new Date();
//   t.setDate(t.getDate() + 1);
//   return t;
// }

// function getNextDay(dayOfWeek) {
//   const d = new Date();
//   const today = d.getDay();
//   const diff = dayOfWeek - today;
//   d.setDate(d.getDate() + (diff <= 0 ? diff + 7 : diff));
//   return d;
// }

// src/ai/extractTasks.js
import client from "./openaiClient.js";
import { checkAndUpdateUsage } from "../utils/aiUsage.js";

export const extractTasks = async (content, user) => {
  await checkAndUpdateUsage(user);
  const today = getTodayDate();
  const normalized = normalizeContent(content);
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `
Today is ${today}.

Extract ALL actionable tasks from the note.

IMPORTANT:
- Consider bullet points, checklists, and sentences
- Treat each bullet or line as a potential task
- Ignore non-actionable text

TASK TYPES:
- "one_time" → happens once
- "recurring" → repeated (daily/weekly)

DATE RULES:
- Convert "tomorrow", "next Friday", "in 2 days" → exact ISO (YYYY-MM-DD)
- If ambiguous (e.g. "Friday"), assume NEXT upcoming Friday
- If no date → null

RECURRENCE RULES:
- "every day", "daily" → daily
- "every Monday" → weekly
- otherwise → "none"

PRIORITY RULES:
- urgent, asap → high
- important → medium
- default → low

Return STRICT JSON array:

[
  {
    "title": "short task",
    "type": "one_time | recurring",
    "dueAt": "YYYY-MM-DD or null",
    "recurrence": "daily | weekly | none",
    "priority": "low | medium | high",
    "sourceText": "original sentence"
  }
]
`,
      },
      {
        role: "user",
        content: normalized,
      },
    ],
  });

  const text = response.choices[0].message.content;

  const parsed = safeParseTasks(text);
  return postProcessTasks(parsed);
};

function postProcessTasks(tasks) {
  return tasks.map((t) => ({
    ...t,
    recurrence: t.recurrence || "none",
    priority: t.priority || "low",
    type: t.recurrence !== "none" ? "recurring" : "one_time",
  }));
}

function safeParseTasks(text) {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Task parse failed:", text);
    return [];
  }
}
function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}
function normalizeContent(content) {
  return content
    .replace(/•/g, "\n- ")
    .replace(/\*/g, "\n- ")
    .replace(/^\s*-\s*/gm, "- ")
    .trim();
}
