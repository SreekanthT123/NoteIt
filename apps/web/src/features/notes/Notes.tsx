import NotesCard from "./NoteCard";
import Masonry from "react-masonry-css";
import { useState } from "react";
import { PenLine, Sparkles } from "lucide-react";

export const Notes = ({ notes, onUpdateNote, taskUpdateMutation, hasNextPage, isFetchingNextPage, onLoadMore, showAiSummary, deleteMutation, onCreateNote }: any) => {
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const breakpointColumnsObj = {
    default: 3,
    1024: 2,
    768: 1,
  };

  if (!notes || notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-6 text-center px-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center shadow-md">
            <PenLine className="w-9 h-9 text-indigo-500" />
          </div>
          <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-violet-200 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-violet-500" />
          </div>
        </div>
        <div className="space-y-2 max-w-sm">
          <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">
            Your canvas is empty
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Capture ideas, thoughts, and tasks — Note<span className="text-blue-500 font-semibold">!</span>t will extract action items and surface insights automatically.
          </p>
        </div>
        <button
          onClick={onCreateNote}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium text-white shadow-lg hover:opacity-90 active:scale-95 transition-all duration-150"
          style={{ background: "linear-gradient(135deg, #7C6FFF 0%, #a78bfa 100%)" }}
        >
          <PenLine className="w-4 h-4" />
          Write your first note
        </button>
        <p className="text-xs text-slate-400">
          Tip: use the <span className="font-medium text-slate-500">+</span> button on the left anytime to add a note
        </p>
      </div>
    );
  }

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
              showAiSummary={showAiSummary}
              deleteMutation={deleteMutation}
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
