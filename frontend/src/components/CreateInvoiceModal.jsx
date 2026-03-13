import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";

export function CreateInvoiceModal({ open, onClose, onCreate }) {
  const api = useApi();
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    client: "",
    project: "",
    amount: "",
    due_date: "",
  });

  // Load clients when modal opens
  useEffect(() => {
    if (!open) return;
    api
      .get("/clients/")
      .then((r) => setClients(Array.isArray(r.data) ? r.data : r.data.results ?? []))
      .catch(() => {});
  }, [open, api]);

  // Load projects when a client is selected
  useEffect(() => {
    if (!form.client) {
      setProjects([]);
      setForm((p) => ({ ...p, project: "" }));
      return;
    }
    api
      .get("/projects/", { params: { client: form.client } })
      .then((r) => setProjects(Array.isArray(r.data) ? r.data : r.data.results ?? []))
      .catch(() => setProjects([]));
  }, [form.client, api]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        client: Number(form.client),
        project: form.project ? Number(form.project) : null,
        amount: form.amount,
        due_date: form.due_date || null,
      };
      const response = await api.post("/invoices/", payload);
      onCreate(response.data);
      setForm({ client: "", project: "", amount: "", due_date: "" });
      onClose();
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data?.detail ||
        data?.amount?.[0] ||
        data?.client?.[0] ||
        "Failed to create invoice. Please check the fields.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl shadow-black/60">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">New invoice</h2>
            <p className="text-xs text-slate-500">Create and send to your client portal</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {/* Client */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300" htmlFor="invoice-client">
              Client <span className="text-red-400">*</span>
            </label>
            <select
              id="invoice-client"
              name="client"
              value={form.client}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/20 focus:ring"
            >
              <option value="">Select a client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Project (optional) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300" htmlFor="invoice-project">
              Project <span className="text-slate-600">(optional)</span>
            </label>
            <select
              id="invoice-project"
              name="project"
              value={form.project}
              onChange={handleChange}
              disabled={!form.client || projects.length === 0}
              className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/20 focus:ring disabled:opacity-40"
            >
              <option value="">None</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300" htmlFor="invoice-amount">
              Amount (USD) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                $
              </span>
              <input
                id="invoice-amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950/60 py-2 pl-7 pr-3 text-sm text-slate-100 outline-none ring-emerald-500/20 focus:ring"
              />
            </div>
          </div>

          {/* Due date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300" htmlFor="invoice-due-date">
              Due date <span className="text-slate-600">(optional)</span>
            </label>
            <input
              id="invoice-due-date"
              name="due_date"
              type="date"
              value={form.due_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/20 focus:ring"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-emerald-600/80 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-emerald-500/20 hover:bg-emerald-500/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Create invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
