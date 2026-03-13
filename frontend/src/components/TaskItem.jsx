export function TaskItem({ task, onStatusChange, onDelete }) {
  const handleChange = (event) => {
    const status = event.target.value;
    onStatusChange(task, status);
  };

  return (
    <div className="rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 space-y-1">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-slate-100">{task.title}</p>
          {task.description && (
            <p className="mt-1 text-[11px] text-slate-400 line-clamp-3">
              {task.description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDelete(task)}
          className="text-[10px] text-slate-500 hover:text-red-400"
        >
          Remove
        </button>
      </div>
      <div className="flex items-center justify-between gap-2">
        <select
          value={task.status}
          onChange={handleChange}
          className="mt-1 rounded-md border border-slate-700 bg-slate-900/80 px-2 py-1 text-[10px] text-slate-100 outline-none ring-emerald-500/20 focus:ring"
        >
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
        {task.due_date && (
          <span className="text-[10px] text-slate-400">
            Due {task.due_date}
          </span>
        )}
      </div>
    </div>
  );
}

