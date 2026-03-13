const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return "";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const formatDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const FILE_ICONS = {
  pdf: { bg: "bg-red-500/15", text: "text-red-400", label: "PDF" },
  doc: { bg: "bg-blue-500/15", text: "text-blue-400", label: "DOC" },
  docx: { bg: "bg-blue-500/15", text: "text-blue-400", label: "DOC" },
  xls: { bg: "bg-green-500/15", text: "text-green-400", label: "XLS" },
  xlsx: { bg: "bg-green-500/15", text: "text-green-400", label: "XLS" },
  png: { bg: "bg-purple-500/15", text: "text-purple-400", label: "IMG" },
  jpg: { bg: "bg-purple-500/15", text: "text-purple-400", label: "IMG" },
  jpeg: { bg: "bg-purple-500/15", text: "text-purple-400", label: "IMG" },
  gif: { bg: "bg-purple-500/15", text: "text-purple-400", label: "IMG" },
  webp: { bg: "bg-purple-500/15", text: "text-purple-400", label: "IMG" },
  mp4: { bg: "bg-orange-500/15", text: "text-orange-400", label: "VID" },
  zip: { bg: "bg-yellow-500/15", text: "text-yellow-400", label: "ZIP" },
  rar: { bg: "bg-yellow-500/15", text: "text-yellow-400", label: "ZIP" },
};

function FileIcon({ filename }) {
  const ext = filename?.split(".").pop()?.toLowerCase() ?? "";
  const icon = FILE_ICONS[ext] ?? {
    bg: "bg-slate-700/60",
    text: "text-slate-400",
    label: ext.toUpperCase().slice(0, 3) || "FILE",
  };
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${icon.bg}`}
    >
      <span className={`text-[9px] font-bold tracking-wide ${icon.text}`}>
        {icon.label}
      </span>
    </div>
  );
}

export function FileList({ files, loading }) {
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
    "http://localhost:8000";

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-14 animate-pulse rounded-lg bg-slate-800/50"
          />
        ))}
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-800 py-8 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-500">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>
        <p className="text-xs text-slate-500">No files uploaded yet</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {files.map((f) => {
        const name = f.file_name || f.file?.split("/").pop() || "file";
        const downloadUrl = f.file?.startsWith("http")
          ? f.file
          : `${baseUrl}${f.file}`;
        return (
          <li
            key={f.id}
            className="group flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-3 transition-colors hover:border-slate-700 hover:bg-slate-900/60"
          >
            <FileIcon filename={name} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-100">
                {name}
              </p>
              <p className="text-[11px] text-slate-500">
                {f.uploaded_by_name || "You"}
                {f.file_size ? ` · ${formatBytes(f.file_size)}` : ""}
                {f.created_at ? ` · ${formatDate(f.created_at)}` : ""}
              </p>
            </div>

            <a
              href={downloadUrl}
              download={name}
              target="_blank"
              rel="noreferrer"
              title="Download"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-500 opacity-0 transition-all hover:bg-slate-800 hover:text-slate-200 group-hover:opacity-100"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
