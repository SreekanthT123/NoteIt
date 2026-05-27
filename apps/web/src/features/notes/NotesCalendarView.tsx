import { useState, useEffect } from "react";
import NotesCard from "./NoteCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea, ScrollBar } from "../../components/ui/scroll-area";

export const NotesCalendarView = ({
  notes = [],
  weekOffset,
  onWeekChange,
  onUpdateNote,
  showAiSummary,
  deleteMutation,
}: any) => {
  const weekDates = getWeekDates(weekOffset);
  const [selectedDatein, setSelectedDatein] = useState(
    toLocalDateKey(new Date()),
  );

  useEffect(() => {
    const todayKey = toLocalDateKey(new Date());
    const weekKeys = weekDates.map(toLocalDateKey);
    setSelectedDatein(weekKeys.includes(todayKey) ? todayKey : weekKeys[0]);
  }, [weekOffset]);

  const grouped = groupNotesByDate(notes);

  const weekLabel = `${weekDates[0].toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${weekDates[6].toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-200">
        <button
          onClick={() => onWeekChange((o: number) => o - 1)}
          className="p-1 rounded-full hover:bg-slate-200 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-medium text-slate-600 min-w-[180px] text-center">
          {weekLabel}
        </span>
        <button
          onClick={() => onWeekChange((o: number) => o + 1)}
          disabled={weekOffset === 0}
          className="p-1 rounded-full hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={18} />
        </button>
        {weekOffset !== 0 && (
          <button
            onClick={() => onWeekChange(0)}
            className="ml-2 text-xs text-indigo-500 hover:underline"
          >
            Today
          </button>
        )}
      </div>

      {weekDates.map((day) => {
        const key = toLocalDateKey(day);
        const dayNotes = grouped[key] || [];

        return (
          <div
            key={key}
            className={`h-full w-full flex items-center p-2 ${key === selectedDatein ? "bg-white rounded-r-md border-l-4" : "border-b-2 border-white"}`}
          >
            <div
              onClick={() => setSelectedDatein(key)}
              className={`min-w-[10%] text-slate-400 flex gap-2 cursor-pointer hover:text-slate-500 pl-2 ${key === selectedDatein ? "text-slate-800 font-medium flex-col text-2xl" : "text-lg"}`}
            >
              <span>
                {day.toLocaleDateString("en-US", { weekday: "short" })},
              </span>
              <span className="font-semibold">
                {day.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>

            {key === selectedDatein ? (
              <div className="p-1 min-w-[90%]">
                <div className=" h-full w-full">
                  <ScrollArea className=" w-full rounded-md">
                    <div className="flex w-max space-x-4 ">
                      {dayNotes.length === 0 ? (
                        <div className="text-slate-400 text-sm flex items-center">
                          No notes this day
                        </div>
                      ) : (
                        dayNotes.map((n: any) => (
                          <div key={n._id} className="max-w-xl min-w-xl">
                            <NotesCard
                              note={n}
                              onUpdateNote={onUpdateNote}
                              showAiSummary={showAiSummary}
                              deleteMutation={deleteMutation}
                            />
                          </div>
                        ))
                      )}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setSelectedDatein(key)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xl cursor-pointer
                  ${dayNotes.length === 0 ? "text-slate-400" : "text-orange-500 bg-orange-100 px-4 hover:bg-orange-200 transition-colors"}`}
              >
                {dayNotes.length} {dayNotes.length <= 1 ? "note" : "notes"}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function groupNotesByDate(notes: any[]) {
  const map: Record<string, any[]> = {};
  for (const note of notes) {
    const date = toLocalDateKey(new Date(note.createdAt));
    if (!map[date]) map[date] = [];
    map[date].push(note);
  }
  return map;
}

export function getWeekDates(weekOffset = 0): Date[] {
  const today = new Date();
  const day = today.getDay();
  const start = new Date(today);
  start.setDate(today.getDate() - day + weekOffset * 7);
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}
