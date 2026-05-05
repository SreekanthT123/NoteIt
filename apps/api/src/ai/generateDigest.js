import { checkAndUpdateUsage } from "../utils/aiUsage.js";

export const generateDigest = async (notes, tasks, user) => {
  await checkAndUpdateUsage(user);
  await new Promise((res) => setTimeout(res, 300));

  const pendingTasks = tasks.filter((t) => t.status !== "done");

  return {
    summary: `You created ${notes.length} notes today and have ${pendingTasks.length} pending tasks.`,
    highlights: notes.slice(0, 3).map((n) => n.body.slice(0, 40)),
    focusAreas: extractFocusAreas(notes),
  };
};

function extractFocusAreas(notes) {
  const words = notes.flatMap((n) => n.body.toLowerCase().split(" "));

  const freq = {};

  for (let w of words) {
    if (w.length < 4) continue;
    freq[w] = (freq[w] || 0) + 1;
  }

  return Object.keys(freq)
    .sort((a, b) => freq[b] - freq[a])
    .slice(0, 3);
}
