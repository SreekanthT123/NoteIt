import { EllipsisVertical } from "lucide-react";
import TaskCard from "./TaskCard";

export const Tasks = ({ tasks, mutation }: any) => {
  return (
    <div className="px-4">
      <div className="flex gap-4">
        <div className="w-[33%] bg-white rounded-lg p-4">
          <div className="text-slate-500 font-medium flex justify-between items-center">
            Tasks in Todo{" "}
            <EllipsisVertical size={16} className="text-slate-500" />
          </div>
          <div className="flex flex-col gap-4 mt-4">
            {tasks
              .filter((t: any) => t.status === "todo")
              .sort((a: any, b: any) => {
                // high priority first
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return (
                  priorityOrder[b.priority as keyof typeof priorityOrder] -
                  priorityOrder[a.priority as keyof typeof priorityOrder]
                );
              })
              .map((t: any) => (
                <TaskCard
                  task={t}
                  startTask={() =>
                    mutation.mutate({ id: t._id, status: "in_progress" })
                  }
                  cancelTask={() =>
                    mutation.mutate({ id: t._id, status: "todo" })
                  }
                  completeTask={() =>
                    mutation.mutate({ id: t._id, status: "done" })
                  }
                />
              ))}
          </div>
        </div>
        <div className="w-[33%] bg-white rounded-lg p-4">
          <div className="text-slate-500 font-medium flex justify-between items-center">
            Tasks In Progress{" "}
            <EllipsisVertical size={16} className="text-slate-500" />
          </div>
          <div className="flex flex-col gap-4 mt-4">
          {tasks
            .filter((t: any) => t.status === "in_progress")
            .map((t: any) => (
              <TaskCard
                task={t}
                startTask={() =>
                  mutation.mutate({ id: t._id, status: "in_progress" })
                }
                cancelTask={() =>
                  mutation.mutate({ id: t._id, status: "todo" })
                }
                completeTask={() =>
                  mutation.mutate({ id: t._id, status: "done" })
                }
              />
            ))}
            </div>
        </div>
        <div className="w-[33%] bg-white rounded-lg p-4">
          <div className="text-slate-500 font-medium flex justify-between items-center">
            Tasks Completed{" "}
            <EllipsisVertical size={16} className="text-slate-500" />
          </div>
          <div className="flex flex-col gap-4 mt-4">
          {tasks
            .filter((t: any) => t.status === "done")
            .map((t: any) => (
              <TaskCard
                task={t}
                startTask={() =>
                  mutation.mutate({ id: t._id, status: "in_progress" })
                }
                cancelTask={() =>
                  mutation.mutate({ id: t._id, status: "todo" })
                }
                completeTask={() =>
                  mutation.mutate({ id: t._id, status: "done" })
                }
              />
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};
