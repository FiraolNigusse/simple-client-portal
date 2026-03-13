import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";

export function FileList({ files, loading }) {
  const getIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'png', 'svg'].includes(ext)) return (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
    if (ext === 'pdf') return (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
    return (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {files.map(file => (
        <Card key={file.id} className="group flex items-center gap-4 py-4 hover:border-primary transition-all">
          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
            {getIcon(file.filename)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-portal-text truncate">{file.filename}</p>
            <p className="text-[10px] text-portal-muted uppercase font-bold tracking-wider">
              {Math.round(file.size / 1024)} KB • {new Date(file.uploaded_at).toLocaleDateString()}
            </p>
          </div>
          <a 
            href={file.file} 
            download 
            className="text-portal-muted hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
            title="Download"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
        </Card>
      ))}
      {files.length === 0 && (
        <div className="col-span-full py-12 text-center text-portal-muted text-sm italic">
          No files shared yet.
        </div>
      )}
    </div>
  );
}
