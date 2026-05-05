export const findRelations = async (newNote, existingNotes) => {
  await new Promise((res) => setTimeout(res, 400));

  const relations = [];
  const newText = newNote.body.toLowerCase();

  for (let note of existingNotes) {
    const existingText = note.body.toLowerCase();

    let score = 0;

    // simple keyword overlap
    const newWords = newText.split(" ");
    const existingWords = existingText.split(" ");

    const commonWords = newWords.filter((w) => existingWords.includes(w));
    score = commonWords.length / Math.max(newWords.length, 1);

    if (score > 0.2) {
      relations.push({
        toNoteId: note._id,
        type: "similar",
        confidence: score,
      });
    }
  }

  return relations;
};
