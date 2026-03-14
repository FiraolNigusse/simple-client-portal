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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-sidebar/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white shadow-2xl shadow-gray-200/50">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-50 px-8 py-6">
          <div>
            <h2 className="text-xl font-bold text-portal-text">New Invoice</h2>
            <p className="text-xs text-portal-muted font-medium">Create and send to your client portal</p>
          </div>
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

        <form onSubmit={handleSubmit} className="space-y-6 px-8 py-8">
          {/* Client */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-portal-muted uppercase tracking-widest ml-1" htmlFor="invoice-client">
              Client <span className="text-portal-error">*</span>
            </label>
            <select
              id="invoice-client"
              name="client"
              value={form.client}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-portal-text transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5"
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
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-portal-muted uppercase tracking-widest ml-1" htmlFor="invoice-project">
              Project <span className="lowercase font-normal opacity-60">(optional)</span>
            </label>
            <select
              id="invoice-project"
              name="project"
              value={form.project}
              onChange={handleChange}
              disabled={!form.client || projects.length === 0}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-portal-text transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5 disabled:opacity-40"
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
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-portal-muted uppercase tracking-widest ml-1" htmlFor="invoice-amount">
              Amount (USD) <span className="text-portal-error">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-portal-muted">
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
                className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-8 pr-4 text-sm font-bold text-portal-text outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
              />
            </div>
          </div>

          {/* Due date */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-portal-muted uppercase tracking-widest ml-1" htmlFor="invoice-due-date">
              Due date <span className="lowercase font-normal opacity-60">(optional)</span>
            </label>
            <input
              id="invoice-due-date"
              name="due_date"
              type="date"
              value={form.due_date}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-portal-text focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-portal-muted hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-indigo-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Sending…" : "Send Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
