import { CheckCircle2, CircleDashed, EllipsisVertical, ListChecks } from "lucide-react";
import { toast } from "sonner";
import TaskCard from "./TaskCard";

export const Tasks = ({ tasks, mutation, deleteMutation, onViewSourceNote }: any) => {
  const todoTasks = tasks
    .filter((t: any) => t.status === "todo")
    .sort((a: any, b: any) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (
        priorityOrder[b.priority as keyof typeof priorityOrder] -
        priorityOrder[a.priority as keyof typeof priorityOrder]
      );
    });

  const inProgressTasks = tasks.filter((t: any) => t.status === "in_progress");
  const doneTasks = tasks.filter((t: any) => t.status === "done");

  return (
    <div className="px-4">
      <div className="flex gap-4">
        {/* ── Todo ── */}
        <div className="w-[33%] bg-white rounded-lg p-4">
          <div className="text-slate-500 font-medium flex justify-between items-center">
            Tasks in Todo
            <EllipsisVertical
              size={16}
              className="text-slate-500 cursor-pointer"
              onClick={() => toast.info("Column actions — coming soon")}
            />
          </div>
          <div className="flex flex-col gap-4 mt-4">
            {todoTasks.map((t: any) => (
              <TaskCard
                key={t._id}
                task={t}
                startTask={() => mutation.mutate({ id: t._id, status: "in_progress" })}
                cancelTask={() => mutation.mutate({ id: t._id, status: "todo" })}
                completeTask={() => mutation.mutate({ id: t._id, status: "done" })}
                deleteMutation={deleteMutation}
                onViewSourceNote={onViewSourceNote}
              />
            ))}
            {todoTasks.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-10 text-slate-400 text-sm">
                <CircleDashed size={28} className="text-slate-300" />
                No tasks here
              </div>
            )}
          </div>
        </div>

        {/* ── In Progress ── */}
        <div className="w-[33%] bg-white rounded-lg p-4">
          <div className="text-slate-500 font-medium flex justify-between items-center">
            Tasks In Progress
            <EllipsisVertical
              size={16}
              className="text-slate-500 cursor-pointer"
              onClick={() => toast.info("Column actions — coming soon")}
            />
          </div>
          <div className="flex flex-col gap-4 mt-4">
            {inProgressTasks.map((t: any) => (
              <TaskCard
                key={t._id}
                task={t}
                startTask={() => mutation.mutate({ id: t._id, status: "in_progress" })}
                cancelTask={() => mutation.mutate({ id: t._id, status: "todo" })}
                completeTask={() => mutation.mutate({ id: t._id, status: "done" })}
                deleteMutation={deleteMutation}
                onViewSourceNote={onViewSourceNote}
              />
            ))}
            {inProgressTasks.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-10 text-slate-400 text-sm">
                <ListChecks size={28} className="text-slate-300" />
                No tasks in progress
              </div>
            )}
          </div>
        </div>

        {/* ── Done ── */}
        <div className="w-[33%] bg-white rounded-lg p-4">
          <div className="text-slate-500 font-medium flex justify-between items-center">
            Tasks Completed
            <EllipsisVertical
              size={16}
              className="text-slate-500 cursor-pointer"
              onClick={() => toast.info("Column actions — coming soon")}
            />
          </div>
          <div className="flex flex-col gap-4 mt-4">
            {doneTasks.map((t: any) => (
              <TaskCard
                key={t._id}
                task={t}
                startTask={() => mutation.mutate({ id: t._id, status: "in_progress" })}
                cancelTask={() => mutation.mutate({ id: t._id, status: "todo" })}
                completeTask={() => mutation.mutate({ id: t._id, status: "done" })}
                deleteMutation={deleteMutation}
                onViewSourceNote={onViewSourceNote}
              />
            ))}
            {doneTasks.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-10 text-slate-400 text-sm">
                <CheckCircle2 size={28} className="text-slate-300" />
                Nothing completed yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
