export function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl shadow-black/40">
        <div className="space-y-2 text-center mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-slate-50">
            Welcome back
          </h1>
          <p className="text-sm text-slate-400">
            Connect to your client portal. Hook this screen up to your Django
            auth endpoints when you add business logic.
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/20 focus:ring"
              placeholder="you@example.com"
              disabled
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/20 focus:ring"
              placeholder="••••••••"
              disabled
            />
          </div>
          <button
            type="button"
            disabled
            className="inline-flex w-full items-center justify-center rounded-md bg-emerald-500/70 px-3 py-2 text-sm font-medium text-slate-900 shadow-sm shadow-emerald-500/30 ring-emerald-500/40 transition hover:bg-emerald-400/80 focus-visible:outline-none focus-visible:ring disabled:cursor-not-allowed disabled:bg-emerald-500/40"
          >
            Sign in (wire up later)
          </button>
        </div>
      </div>
    </div>
  );
}

