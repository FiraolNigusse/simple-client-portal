export function TaskItem({ task, onStatusChange, onDelete }) {
  const handleChange = (event) => {
    const status = event.target.value;
    onStatusChange(task, status);
  };

  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/5 px-4 py-3 space-y-2 transition-all hover:bg-white/[0.02]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-portal-text group-hover:text-primary transition-colors">{task.title}</p>
          {task.description && (
            <p className="mt-1 text-xs text-portal-muted line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDelete(task)}
          className="p-1 rounded-lg text-portal-muted hover:bg-portal-error/10 hover:text-portal-error transition-all"
          title="Remove task"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="relative">
          <select
            value={task.status}
            onChange={handleChange}
            className={`
              appearance-none rounded-lg border px-3 py-1 text-[10px] font-bold uppercase tracking-wider outline-none transition-all cursor-pointer
              ${task.status === "done" 
                ? "bg-portal-success/10 border-portal-success/20 text-portal-success shadow-[0_0_10px_rgba(16,185,129,0.1)]" 
                : task.status === "in_progress" 
                  ? "bg-primary/10 border-primary/20 text-primary shadow-[0_0_10px_var(--primary-glow)]"
                  : "bg-white/5 border-white/10 text-portal-muted"
              }
            `}
          >
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        {task.due_date && (
          <span className="text-[10px] font-medium text-portal-muted flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {task.due_date}
          </span>
        )}
      </div>
    </div>
  );
}

