import { useState } from "react";
import { UpgradeBanner } from "./UpgradeBanner";

export function CreateClientModal({ open, onClose, onCreate, loading }) {
  const [form, setForm] = useState({ name: "", email: "", company: "" });
  const [planError, setPlanError] = useState(null);

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setPlanError(null);
    onCreate(form, () => {
      setForm({ name: "", email: "", company: "" });
    }, (err) => {
      // Detect plan limit 403
      const code = err?.response?.data?.code;
      if (code === "plan_limit_reached") {
        setPlanError(err.response.data);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-black/50">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">
            New client
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Close
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/20 focus:ring"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/20 focus:ring"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300" htmlFor="company">
              Company (optional)
            </label>
            <input
              id="company"
              name="company"
              type="text"
              className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/20 focus:ring"
              value={form.company}
              onChange={handleChange}
            />
          </div>
          {planError && (
            <UpgradeBanner resource="clients" onDismiss={() => setPlanError(null)} />
          )}
          <button
            type="submit"
            disabled={loading || Boolean(planError)}
            className="inline-flex w-full items-center justify-center rounded-md bg-emerald-500/80 px-3 py-2 text-sm font-medium text-slate-900 shadow-sm shadow-emerald-500/30 ring-emerald-500/40 transition hover:bg-emerald-400/80 focus-visible:outline-none focus-visible:ring disabled:cursor-not-allowed disabled:bg-emerald-500/40"
          >
            {loading ? "Creating..." : "Create client"}
          </button>
        </form>
      </div>
    </div>
  );
}

