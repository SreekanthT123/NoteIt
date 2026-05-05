import {
  CheckIcon,
  XIcon,
  CirclePlay,
  EllipsisVertical,
  CircleArrowOutUpLeft,
} from "lucide-react";
import { Button } from "../../components/ui/button";

const TaskCard = ({ task, startTask, cancelTask, completeTask, view }: any) => {
  return (
    <div
      className={`task-card p-2 rounded-lg my-2 flex justify-between  ${view != "calendarView" ? "flex-row items-center" : "flex-col items-start"} ${task.status === "todo" ? "bg-[#D6EFFF]" : task.status === "in_progress" ? "bg-[#FFE4D6]" : "bg-[#DFFFE2]"}`}
    >
      <div className="flex flex-col items-start gap-1">
        {view != "calendarView" && (
          <div className="text-[10px] text-slate-500 flex items-center gap-1 justify start bg-white p-1 rounded-xl">
            <CircleArrowOutUpLeft size={10} />
          </div>
        )}
        <div className="text-base font-normal">{task.title}</div>
        {task.dueAt && (
          <div className="text-xs text-slate-500">
            Due date:{" "}
            {new Date(task.dueAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            })}
          </div>
        )}
      </div>
      <div
        className={`flex gap-1 items-center ${view === "calendarView" ? "justify-end w-full border-t-2 border-white pt-2 mt-2" : ""}`}
      >
        {task.status === "todo" && (
          <Button
            className="text-blue-500 hover:text-blue-600 rounded-full"
            variant="ghost"
            size="icon-sm"
            onClick={() => startTask(task._id)}
          >
            {" "}
            <CirclePlay />
          </Button>
        )}
        {task.status === "in_progress" || task.status === "todo" ? (
          <Button
            className="text-green-500 hover:text-green-600 rounded-full"
            variant="ghost"
            size="icon-sm"
            onClick={() => completeTask(task._id)}
          >
            {" "}
            <CheckIcon />
          </Button>
        ) : null}
        {task.status === "in_progress" && (
          <Button
            className="text-red-500 hover:text-red-600 rounded-full"
            variant="ghost"
            size="icon-sm"
            onClick={() => cancelTask(task._id)}
          >
            {" "}
            <XIcon />
          </Button>
        )}
        <EllipsisVertical size={16} className="text-slate-500" />
      </div>
      {/* <p>Status: {task.status}</p> */}
    </div>
  );
};

export default TaskCard;
