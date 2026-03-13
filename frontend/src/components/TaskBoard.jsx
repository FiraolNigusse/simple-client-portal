import { TaskItem } from "./TaskItem";

export function TaskBoard({ tasks, onStatusChange, onDelete }) {
  const columns = [
    { key: "todo", title: "To do" },
    { key: "in_progress", title: "In progress" },
    { key: "done", title: "Done" }
  ];

  const grouped = tasks.reduce(
    (acc, task) => {
      acc[task.status] = acc[task.status] || [];
      acc[task.status].push(task);
      return acc;
    },
    { todo: [], in_progress: [], done: [] }
  );

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {columns.map((column) => (
        <div key={column.key} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              {column.title}
            </p>
            <span className="text-[10px] text-slate-500">
              {grouped[column.key]?.length ?? 0}
            </span>
          </div>
          <div className="space-y-2">
            {grouped[column.key].length === 0 ? (
              <p className="text-[11px] text-slate-500">
                No tasks in this column yet.
              </p>
            ) : (
              grouped[column.key].map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

