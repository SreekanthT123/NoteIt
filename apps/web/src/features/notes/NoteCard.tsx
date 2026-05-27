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
  Trash,
} from "lucide-react";
import { format } from "date-fns";
import { Editor } from "../general/Editor";
import TaskCard from "../tasks/TaskCard";
import { Checkbox } from "../../components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
const NotesCard = ({
  note,
  onUpdateNote,
  isExpanded,
  taskUpdateMutation,
  showAiSummary,
  deleteMutation,
}: any) => {
  const isNewNote = note._id.includes("temp");
  const [editedTitle, setEditedTitle] = useState(note.title || "");
  const [editedText, setEditedText] = useState(note.body);
  const [isEditing, setIsEditing] = useState(isNewNote);
  const [editedTheme, setEditedTheme] = useState<keyof typeof NOTE_THEMES>(
    note.theme,
  );
  const [showDetails, setShowDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractTasksEnabled, setExtractTasksEnabled] = useState(true);
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
      className={`editor-container relative p-4 rounded-2xl flex flex-col gap-2 h-full
      ${theme.bg} backdrop-blur-md border border-white/20 shadow-sm ${theme.selection}
      `}
    >
      <div className="text-base font-medium flex items-center gap-2 py-1">
        <NotebookText />
        <input
          className="bg-transparent outline-none font-medium text-base  w-full placeholder:text-gray-400 cursor-text"
          value={editedTitle}
          onChange={(e) => {
            setEditedTitle(e.target.value);
            setIsEditing(true);
          }}
          onClick={() => setIsEditing(true)}
          placeholder="Untitled"
        />
      </div>
      <Editor
        value={editedText}
        onChange={setEditedText}
        onFocus={() => setIsEditing(true)}
        autofocus={isNewNote}
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
            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
              <Checkbox
                checked={extractTasksEnabled}
                onCheckedChange={() =>
                  setExtractTasksEnabled(!extractTasksEnabled)
                }
                className="rounded bg-white"
              />
              Extract tasks
            </label>{" "}
            |
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              disabled={isSaving}
              onClick={async () => {
                setIsSaving(true);
                try {
                  await onUpdateNote(
                    note._id,
                    editedText,
                    editedTheme,
                    editedTitle,
                    extractTasksEnabled,
                  );
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
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => deleteMutation?.mutate({ id: note._id, type: 'note' })}>
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
          {showAiSummary && (
            <div className={`p-4 rounded-lg ${theme.subBg}`}>
              <div className="text-[10px] pb-1 font-medium flex items-center gap-1 justify-start">
                <Bot className={`p-1 rounded-full ${theme.bg}`} size={18} /> AI
                Summary
              </div>
              <div className={`text-xs `}>{note.aiSummary}</div>
            </div>
          )}
          {showDetails && (
            <div className="mt-2 p-2 rounded-lg bg-white/30 flex flex-col gap-2">
              <div className="text-xs font-semibold">Tasks</div>

              {note.extractedTasks?.length > 0 ? (
                note.extractedTasks.map((t: any) => (
                  <div key={t._id} className="">
                    {/* <span>• {t.title}</span>
                    {t.dueAt && (
                      <span className="text-gray-500">
                        {format(new Date(t.dueAt), "MMM d")}
                      </span>
                    )} */}
                    <TaskCard
                      task={t}
                      startTask={(id: string) =>
                        taskUpdateMutation?.mutate({
                          id,
                          status: "in_progress",
                        })
                      }
                      completeTask={(id: string) =>
                        taskUpdateMutation?.mutate({ id, status: "done" })
                      }
                      cancelTask={(id: string) =>
                        taskUpdateMutation?.mutate({ id, status: "todo" })
                      }
                      deleteMutation={deleteMutation}
                    />
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
              <span
                onClick={() => setShowDetails((prev) => !prev)}
                className="text-[10px] text-gray-500 px-2 flex gap-1 items-center cursor-pointer hover:text-gray-900 transition-colors"
              >
                <SquareCheck size={16} /> {note.extractedTasks.length}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-center justify-end">
            <div className="text-[10px] text-gray-500  ">
              {format(new Date(note.createdAt), "MMM d, yyyy")}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <EllipsisVertical
                    size={16}
                    className="text-gray-500 cursor-pointer hover:text-gray-900 transition-colors"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => deleteMutation?.mutate({ id: note._id, type: 'note' })}>
                  <Trash />
                  Delete Note
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesCard;
