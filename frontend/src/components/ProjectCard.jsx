export function ProjectCard({ project, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left rounded-xl border border-white/[0.05] bg-surface px-5 py-4 transition-all hover:bg-white/[0.03] hover:shadow-lg hover:shadow-black/20"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Client name */}
          {project.client_name && (
            <p className="text-[11px] font-medium uppercase tracking-wider text-portal-muted">
              {project.client_name}
            </p>
          )}
          {/* Title */}
          <p className="truncate text-sm font-semibold text-portal-text group-hover:text-primary transition-colors drop-shadow-[0_0_8px_var(--primary-glow)]">
            {project.title}
          </p>
          {/* Description */}
          {project.description && (
            <p className="line-clamp-1 text-xs text-portal-muted">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {project.status === "completed" ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-portal-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-portal-muted" />
              Completed
            </span>
          ) : project.status === "pending" ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-portal-warning/20 bg-portal-warning/10 px-2 py-0.5 text-[10px] font-semibold text-portal-warning">
              <span className="h-1.5 w-1.5 rounded-full bg-portal-warning shadow-[0_0_5px_var(--warning)]" />
              Pending
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-portal-success/20 bg-portal-success/10 px-2 py-0.5 text-[10px] font-semibold text-portal-success">
              <span className="h-1.5 w-1.5 rounded-full bg-portal-success shadow-[0_0_5px_var(--success)]" />
              Active
            </span>
          )}

          <svg
            className="h-4 w-4 text-portal-muted transition-colors group-hover:text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </div>
    </button>
  );
}

