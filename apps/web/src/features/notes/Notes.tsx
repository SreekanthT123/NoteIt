import NotesCard from "./NoteCard";
import Masonry from "react-masonry-css";
import { useState } from "react";

export const Notes = ({ notes, onUpdateNote, taskUpdateMutation, hasNextPage, isFetchingNextPage, onLoadMore }: any) => {
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
      {hasNextPage && (
        <div className="flex justify-center py-4">
          <button
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            className="px-6 py-2 rounded-full text-sm bg-slate-200 hover:bg-slate-300 disabled:opacity-50 transition-colors"
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
};
