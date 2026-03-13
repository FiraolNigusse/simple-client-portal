import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center space-y-4">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
          404
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Page not found
        </h1>
        <p className="text-sm text-slate-400 max-w-sm">
          The page you are looking for doesn&apos;t exist yet. As you build
          features, keep routes organized in a single place.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm font-medium text-slate-100 hover:border-emerald-500/80 hover:text-emerald-200"
      >
        Back to dashboard
      </Link>
    </div>
  );
}

