import NotesCard from "./NoteCard";
import Masonry from "react-masonry-css";
import { useState } from "react";

export const Notes = ({ notes, onUpdateNote, taskUpdateMutation }: any) => {
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const breakpointColumnsObj = {
    default: 3,
    1024: 2,
    768: 1,
  };
  return (
    <div className="px-4 py-2 space-y-4">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex gap-4"
        columnClassName="space-y-4"
      >
        {notes?.map((n: any) => (
          <div key={n._id}>
            <NotesCard
              taskUpdateMutation={taskUpdateMutation}
              note={n}
              onUpdateNote={onUpdateNote}
              onExpand={() => setSelectedNote(n)}
            />
          </div>
        ))}
      </Masonry>
    </div>
  );
};
