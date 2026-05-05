import { useEffect, useState } from "react";
import { NOTE_THEMES } from "./noteTheme";
import { Button } from "../../components/ui/button";
import {
  CheckCircle,
  SquareCheck,
  Trash2,
  EllipsisVertical,
  Bot,
  NotebookText,
  LoaderCircle,
} from "lucide-react";
import { format } from "date-fns";
import { Editor } from "../general/Editor";
const NotesCard = ({ note, onUpdateNote, isExpanded }: any) => {
  const [editedText, setEditedText] = useState(note.body);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTheme, setEditedTheme] = useState<keyof typeof NOTE_THEMES>(note.theme);
  const [showDetails, setShowDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const theme = NOTE_THEMES[editedTheme];
  useEffect(() => {
    const handler = (e: any) => {
      if (!e.target.closest(".editor-container")) {
        setIsEditing(false);
      }
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div
      className={`editor-container relative p-4 rounded-2xl flex flex-col gap-2
      ${theme.bg} backdrop-blur-md border border-white/20 shadow-sm ${theme.selection}
      ${
        isExpanded
          ? "w-full max-w-3xl h-[80vh] overflow-y-auto pointer-events-auto z-50 shadow-2xl p-6 md:p-8"
          : ""
      }`}
    >
      <div className="text-base font-medium flex items-center gap-2 py-1">
        <NotebookText /> Note
      </div>
      <Editor
        value={editedText}
        onChange={setEditedText}
        onFocus={() => setIsEditing(true)}
      />

      {isEditing && (
        <div className="flex justify-between items-center border-t-2 border-white pt-4 mt-2 gap-2 w-full">
          <div className="flex gap-1">
            {Object.keys(NOTE_THEMES).map((t) => (
              <div
                key={t}
                className={`w-4 h-4 border border-white rounded-full cursor-pointer ${NOTE_THEMES[t as keyof typeof NOTE_THEMES].bg}`}
                onClick={() => setEditedTheme(t as keyof typeof NOTE_THEMES)}
              ></div>
            ))}
          </div>
          <div className="flex justify-end items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              disabled={isSaving}
              onClick={async () => {
                setIsSaving(true);
                try {
                  await onUpdateNote(note._id, editedText, editedTheme);
                  setIsEditing(false);
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              {isSaving ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <CheckCircle />
              )}
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <Trash2 />
            </Button>
          </div>
        </div>
      )}

      {note.processingStatus === "processing" && (
        <p className="text-yellow-500 text-sm">Processing...</p>
      )}

      {note.processingStatus === "failed" && (
        <p className="text-red-500 text-sm">AI Failed</p>
      )}

      {note.processingStatus === "completed" && (
        <>
          <div className={`p-4 rounded-lg ${theme.subBg}`}>
            <div className="text-[10px] pb-1 font-medium flex items-center gap-1 justify-start">
              <Bot className={`p-1 rounded-full ${theme.bg}`} size={18} /> AI
              Summary
            </div>
            <div className={`text-xs `}>{note.aiSummary}</div>
          </div>
          {showDetails && (
            <div className="mt-2 p-2 rounded-lg bg-white/30">
              <div className="text-xs font-semibold mb-1">Tasks</div>

              {note.extractedTasks?.length > 0 ? (
                note.extractedTasks.map((t: any) => (
                  <div key={t._id} className="text-xs flex justify-between">
                    <span>• {t.title}</span>
                    {t.dueAt && (
                      <span className="text-gray-500">
                        {format(new Date(t.dueAt), "MMM d")}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">No tasks</p>
              )}
            </div>
          )}
        </>
      )}
      {!note._id.includes("temp") && (
        <div className="flex justify-between flex-1 items-end ">
          <div>
            {note.extractedTasks.length > 0 && (
              <span className="text-[10px] text-gray-500 px-2 flex gap-1 items-center">
                <SquareCheck size={16} /> {note.extractedTasks.length}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-center justify-end">
            <div className="text-[10px] text-gray-500  ">
              {format(new Date(note.createdAt), "MMM d, yyyy")}
            </div>
            {/* on clicking elipsis i want to expand the entire card full screen to show all details of the cards including tasks details and ai summary*/}
            {!isExpanded && (
              <EllipsisVertical
                size={16}
                className="text-gray-500 cursor-pointer hover:text-gray-900 transition-colors"
                onClick={() => setShowDetails((prev) => !prev)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesCard;
