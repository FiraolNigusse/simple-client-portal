export function ProjectCard({ project, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-3 hover:border-emerald-500/60 hover:bg-slate-900/60"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-100">{project.title}</p>
          {project.description ? (
            <p className="mt-1 line-clamp-2 text-xs text-slate-400">
              {project.description}
            </p>
          ) : null}
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
            project.status === "completed"
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-600/40"
              : "bg-sky-500/10 text-sky-300 border border-sky-600/40"
          }`}
        >
          {project.status === "completed" ? "Completed" : "Active"}
        </span>
      </div>
    </button>
  );
}

