export function ProjectCard({ project, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left rounded-xl border border-slate-800 bg-slate-950/40 px-5 py-4 transition-all hover:border-emerald-500/40 hover:bg-slate-900/60 hover:shadow-lg hover:shadow-black/20"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Client name */}
          {project.client_name && (
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              {project.client_name}
            </p>
          )}
          {/* Title */}
          <p className="truncate text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
            {project.title}
          </p>
          {/* Description */}
          {project.description && (
            <p className="line-clamp-1 text-xs text-slate-500">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
              project.status === "completed"
                ? "border-emerald-600/40 bg-emerald-500/10 text-emerald-400"
                : "border-sky-600/30 bg-sky-500/10 text-sky-400"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${
              project.status === "completed" ? "bg-emerald-400" : "bg-sky-400"
            }`} />
            {project.status === "completed" ? "Completed" : "Active"}
          </span>

          <svg
            className="h-4 w-4 text-slate-700 transition-colors group-hover:text-emerald-500"
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

