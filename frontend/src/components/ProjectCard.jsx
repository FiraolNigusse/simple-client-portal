export function ProjectCard({ project, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fin-card group w-full text-left p-5 flex items-center justify-between gap-4"
    >
      <div className="min-w-0 flex-1 space-y-1">
        {project.client_name && (
          <p className="text-[11px] font-medium text-[#8B93A1]">
            {project.client_name}
          </p>
        )}
        <p className="truncate text-sm font-semibold text-white group-hover:text-white transition-colors">
          {project.title}
        </p>
        {project.description && (
          <p className="line-clamp-1 text-xs text-[#8B93A1]">
            {project.description}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-4">
        {project.status === "completed" ? (
          <span className="status-badge status-completed">
            Completed
          </span>
        ) : project.status === "pending" ? (
          <span className="status-badge status-pending">
            Pending
          </span>
        ) : (
          <span className="status-badge status-active">
            Active
          </span>
        )}

        <svg
          className="h-3.5 w-3.5 text-[#8B93A1] transition-colors group-hover:text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </button>
  );
}

