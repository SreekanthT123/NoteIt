// we will have a left panel with the list of notes, and a right panel with the details of the selected note. selected note panel will be a form where we can edit the note and save it. on clicking a note in the left panel, we will show the details of the note in the right panel. on clicking the save button, we will update the note in the database and show a success message. on clicking the delete button, we will delete the note from the database and show a success message. on clicking the create button, we will create a new note in the database and show a success message.
import { useState } from "react";
import { api } from "../../api/client";
import NotesCard from "./NoteCard";
import { useInfiniteQuery } from "@tanstack/react-query";
import { EllipsisVertical, List, Notebook } from "lucide-react";
import { NOTE_THEMES } from "./noteTheme";

export const NotesListView = ({ notes, onUpdateNote }: any) => {
  const [selectedNote, setSelectedNote] = useState<any>(null);

  return (
    <div className="flex h-full w-full">
      <div className=" overflow-y-auto p-2 bg-white/50 border-2 w-[320px] rounded-l-md">
        <div className="py-2 mb-4 border-b-2 flex gap-2 text md font-medium">
          <List /> Notes
        </div>
        {/* List of notes */}
        {notes.map((n: any) => {
          const noteTheme = NOTE_THEMES[n.theme as keyof typeof NOTE_THEMES];
          return (
            <div
              className="mb-4"
              key={n._id}
              onClick={() => {
                console.log("Selected note:", n);
                setSelectedNote(n);
              }}
            >
              <div
                className={`${selectedNote?._id===n._id ?"bg-gray-200":"" } p-2 rounded-md cursor-pointer hover:bg-gray-100 flex gap-2 items-center justify-between`}
              >
                
                <div>
                  <div className="font-medium flex gap-2 items-center pb-2"><Notebook size={16}/>{n.title || "Untitled"}</div>
                  <div className="text-sm text-gray-500 ml-6">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2 justify-end">
                <div className={`${noteTheme.bg} p-2 rounded-full`}></div>
                <div><EllipsisVertical color="gray"/></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex-1 border-2 rounded-r-2xl p-1 ">
        {/* Details of selected note */}
        {selectedNote ? (
          <NotesCard note={selectedNote} onUpdateNote={onUpdateNote} />
        ) : (
          <div className="text-slate-400 text-sm flex items-center justify-center h-full">
            Select a note to view details
          </div>
        )}
      </div>
    </div>
  );
};
