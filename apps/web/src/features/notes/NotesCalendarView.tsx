import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";
import { motion } from "framer-motion";
import NotesCard from "./NoteCard";

export const NotesCalendarView = ({ notes, onUpdateNote }: any) => {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");

  //   const { data: notes = [] } = useQuery({
  //     queryKey: ["notes"],
  //     queryFn: async () => {
  //       const res = await api.get("/notes");
  //       return res.data;
  //     },
  //     refetchInterval: 3000,
  //   });

  //   const createMutation = useMutation({
  //     mutationFn: async () => {
  //       await api.post("/notes", { body: text });
  //     },
  //     onSuccess: () => {
  //       queryClient.invalidateQueries({ queryKey: ["notes"] });
  //       setText("");
  //     },
  //   });

  //   const deleteMutation = useMutation({
  //     mutationFn: async (id: string) => {
  //       await api.delete(`/notes/${id}`);
  //     },
  //     onSuccess: () => {
  //       queryClient.invalidateQueries({ queryKey: ["notes"] });
  //     },
  //   });

  const week = getWeekDates();
  const grouped = groupNotesByDate(notes);

  const todayKey = new Date().toISOString().split("T")[0];

  return (
    <div className="grid grid-cols-7">
      {week.map((day) => {
        const key = day.toISOString().split("T")[0];
        const dayNotes = grouped[key] || [];

        return (
          <div key={key} className="border-r-2 border-white p-2 flex flex-col ">
            {/* Header */}
            <div className=" mb-2 text-center">
              {/* get day alone from day like sun mon */}
              <div
                className={`text-xl text-slate-400 ${key === todayKey ? "text-slate-800 font-medium" : ""}`}
              >
                {new Date(day).toLocaleDateString("en-US", {
                  weekday: "short",
                })}
              </div>
              <div
                className={`font-medium text-sm text-slate-400 ${key === todayKey ? "text-slate-800" : ""}`}
              >
                {new Date(day).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="flex-1 space-y-2 overflow-auto p-1">
              {dayNotes.map((n: any, index: number) => (
                <motion.div
                  key={n._id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.25,
                    ease: "easeOut",
                    delay: index * 0.08,
                  }}
                >
                  <NotesCard note={n} onUpdateNote={onUpdateNote} />
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

function groupNotesByDate(notes: any[]) {
  const map: Record<string, any[]> = {};

  for (let note of notes) {
    const date = new Date(note.createdAt).toISOString().split("T")[0];

    if (!map[date]) map[date] = [];

    map[date].push(note);
  }

  return map;
}

function getWeekDates() {
  const today = new Date();
  const day = today.getDay(); // 0-6

  const start = new Date(today);
  start.setDate(today.getDate() - day);

  const week = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    week.push(d);
  }

  return week;
}
