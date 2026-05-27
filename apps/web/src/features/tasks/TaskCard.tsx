import {
  CheckIcon,
  XIcon,
  CirclePlay,
  EllipsisVertical,
  CircleArrowOutUpLeft,
  Clock,
  AlertCircle,
  RotateCcw,
  Trash,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Task {
  _id: string;
  title: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "in_progress" | "done";
  dueAt?: string;
  recurrence?: string;
  sourceNote?: string;
}

interface TaskCardProps {
  task: Task;
  startTask: (id: string) => void;
  cancelTask: (id: string) => void;
  completeTask: (id: string) => void;
  deleteMutation?: any;
  view?: string;
  onViewSourceNote?: (noteId: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isOverdue = (task: Task) =>
  task.dueAt && new Date(task.dueAt) < new Date() && task.status !== "done";

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

// ─── Status config ────────────────────────────────────────────────────────────
// Each status gets its own left-border accent, background tint, and label

const STATUS_CONFIG = {
  todo: {
    label: "To Do",
    borderColor: "#7C6FFF",          // violet
    bg: "bg-violet-50",
    labelClass: "bg-violet-100 text-violet-600",
    dot: "bg-violet-400",
  },
  in_progress: {
    label: "In Progress",
    borderColor: "#F59E0B",          // amber
    bg: "bg-amber-50",
    labelClass: "bg-amber-100 text-amber-600",
    dot: "bg-amber-400",
  },
  done: {
    label: "Done",
    borderColor: "#00D4AA",          // teal
    bg: "bg-teal-50",
    labelClass: "bg-teal-100 text-teal-600",
    dot: "bg-teal-400",
  },
} as const;

// ─── Priority config ──────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  high:   { class: "bg-red-100 text-red-600",    dot: "bg-red-400" },
  medium: { class: "bg-yellow-100 text-yellow-600", dot: "bg-yellow-400" },
  low:    { class: "bg-slate-100 text-slate-500",  dot: "bg-slate-300" },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

const TaskCard = ({
  task,
  startTask,
  cancelTask,
  completeTask,
  deleteMutation,
  view,
  onViewSourceNote,
}: TaskCardProps) => {
  const status   = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.todo;
  const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.low;
  const overdue  = isOverdue(task);
  const isCalendar = view === "calendarView";

  return (
    <div
      className={`
        group relative rounded-xl overflow-hidden
        bg-white border border-slate-200
        shadow-[0_2px_8px_rgba(0,0,0,0.05)]
        hover:shadow-[0_6px_20px_rgba(0,0,0,0.09)]
        transition-all duration-200 hover:-translate-y-[2px]
        ${overdue ? "ring-1 ring-red-300" : ""}
        ${isCalendar ? "flex flex-col" : "flex flex-row items-center"}
      `}
    >
      {/* ── Coloured left accent bar ── */}
      <div
        className="absolute top-0 left-0 w-[3px] h-full rounded-l-xl"
        style={{ background: overdue ? "#EF4444" : status.borderColor }}
      />

      {/* ── Main content ── */}
      <div className={`flex-1 flex gap-3 px-4 py-3 pl-5 ${isCalendar ? "" : "items-center"}`}>

        {/* Status dot */}
        <div className="flex-shrink-0 mt-[3px]">
          <span
            className={`block w-2 h-2 rounded-full ${status.dot} ring-2 ring-white shadow-sm`}
          />
        </div>

        {/* Title + meta */}
        <div className="flex flex-col gap-1 min-w-0 flex-1">

          {/* Title row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-semibold text-slate-800 leading-snug tracking-tight truncate
                ${task.status === "done" ? "line-through text-slate-400" : ""}
              `}
            >
              {task.title}
            </span>

            {/* Overdue badge overrides everything */}
            {overdue && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-600 shrink-0">
                <AlertCircle size={9} />
                Overdue
              </span>
            )}
          </div>

          {/* Pills row */}
          <div className="flex items-center gap-1.5 flex-wrap">

            {/* Status pill */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.labelClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>

            {/* Priority pill */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${priority.class}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
              {task.priority}
            </span>

            {/* Recurrence pill */}
            {task.recurrence && task.recurrence !== "none" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-600">
                <RotateCcw size={9} />
                {task.recurrence}
              </span>
            )}

            {/* Due date */}
            {task.dueAt && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium
                  ${overdue
                    ? "bg-red-100 text-red-600"
                    : "bg-slate-100 text-slate-500"
                  }
                `}
              >
                <Clock size={9} />
                {formatDate(task.dueAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div
        className={`
          flex items-center gap-0.5 px-2
          ${isCalendar
            ? "border-t border-slate-100 py-2 justify-end"
            : "pr-3 border-l border-slate-100 self-stretch justify-center"
          }
        `}
      >
        {/* Source link icon (non-calendar only) */}
        {!isCalendar && task.sourceNote && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-slate-400 hover:text-violet-500 hover:bg-violet-50 rounded-lg transition-colors"
            title="View source note"
            onClick={() => onViewSourceNote?.(task.sourceNote!)}
          >
            <CircleArrowOutUpLeft size={14} />
          </Button>
        )}

        {/* Start — only for todo */}
        {task.status === "todo" && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-violet-500 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors"
            onClick={() => startTask(task._id)}
            title="Start task"
          >
            <CirclePlay size={16} />
          </Button>
        )}

        {/* Complete — todo or in_progress */}
        {(task.status === "todo" || task.status === "in_progress") && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-teal-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
            onClick={() => completeTask(task._id)}
            title="Mark complete"
          >
            <CheckIcon size={15} />
          </Button>
        )}

        {/* Cancel — in_progress only */}
        {task.status === "in_progress" && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            onClick={() => cancelTask(task._id)}
            title="Cancel task"
          >
            <XIcon size={14} />
          </Button>
        )}

        {/* More options */}
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
                <DropdownMenuItem onClick={() => deleteMutation?.mutate({ id: task._id, type: 'task' })}>
                  <Trash />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
      </div>
    </div>
  );
};

export default TaskCard;