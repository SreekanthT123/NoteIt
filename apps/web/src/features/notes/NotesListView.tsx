import { useEffect, useState } from "react";
import NotesCard from "./NoteCard";
import { EllipsisVertical, List, Notebook, Trash } from "lucide-react";
import { NOTE_THEMES } from "./noteTheme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

export const NotesListView = ({
  notes,
  onUpdateNote,
  showAiSummary,
  deleteMutation,
  initialSelectedNoteId,
}: any) => {
  const [selectedNote, setSelectedNote] = useState<any>(null);

  useEffect(() => {
    if (!initialSelectedNoteId) return;
    const note = notes.find((n: any) => n._id === initialSelectedNoteId);
    if (note) setSelectedNote(note);
  }, [initialSelectedNoteId, notes]);

  return (
    <div className="flex h-full w-full">
      <div className="overflow-y-auto p-2 bg-white/50 border-2 w-[320px] rounded-l-md">
        <div className="py-2 mb-4 border-b-2 flex gap-2 text-md font-medium">
          <List /> Notes
        </div>
        {notes.map((n: any) => {
          const noteTheme = NOTE_THEMES[n.theme as keyof typeof NOTE_THEMES];
          return (
            <div className="mb-4" key={n._id} onClick={() => setSelectedNote(n)}>
              <div
                className={`${selectedNote?._id === n._id ? "bg-gray-200" : ""} p-2 rounded-md cursor-pointer hover:bg-gray-100 flex gap-2 items-center justify-between`}
              >
                <div>
                  <div className="font-medium flex gap-2 items-center pb-2">
                    <Notebook size={16} />
                    {n.title || "Untitled"}
                  </div>
                  <div className="text-sm text-gray-500 ml-6">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <div className={`${noteTheme?.bg} p-2 rounded-full`} />
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-1 rounded hover:bg-gray-200 cursor-pointer">
                        <EllipsisVertical size={16} color="gray" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation?.mutate({ id: n._id, type: "note" });
                          if (selectedNote?._id === n._id) setSelectedNote(null);
                        }}
                      >
                        <Trash size={14} />
                        Delete Note
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex-1 border-2 rounded-r-2xl p-1">
        {selectedNote ? (
          <NotesCard
            key={selectedNote._id}
            note={selectedNote}
            onUpdateNote={onUpdateNote}
            showAiSummary={showAiSummary}
            deleteMutation={deleteMutation}
          />
        ) : (
          <div className="text-slate-400 text-sm flex items-center justify-center h-full">
            Select a note to view details
          </div>
        )}
      </div>
    </div>
  );
};
