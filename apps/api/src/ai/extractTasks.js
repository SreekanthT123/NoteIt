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

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `
Today is ${today}.

Extract actionable tasks.

Rules:
- Convert relative dates like "tomorrow", "Friday" into exact ISO dates (YYYY-MM-DD)
- If no date, return null
- Do NOT guess unclear dates

Return STRICT JSON array:
[
  {
    "title": "short task",
    "dueAt": "YYYY-MM-DD or null",
    "sourceText": "original sentence"
  }
]
`,
      },
      {
        role: "user",
        content,
      },
    ],
  });

  const text = response.choices[0].message.content;

  return safeParseTasks(text);
};

function safeParseTasks(text) {
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Task parse failed:", text);
    return [];
  }
}
function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}
