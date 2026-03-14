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
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-sidebar/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-2xl shadow-gray-200/50">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-portal-text">
            New Client
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-portal-muted hover:bg-gray-50 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-portal-muted uppercase tracking-widest ml-1" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-portal-text transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5"
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-portal-muted uppercase tracking-widest ml-1" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-portal-text transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5"
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-portal-muted uppercase tracking-widest ml-1" htmlFor="company">
              Company (optional)
            </label>
            <input
              id="company"
              name="company"
              type="text"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-portal-text transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5"
              placeholder="e.g. Acme Corp"
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
            className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-indigo-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Client"}
          </button>
        </form>
      </div>
    </div>
  );
}

