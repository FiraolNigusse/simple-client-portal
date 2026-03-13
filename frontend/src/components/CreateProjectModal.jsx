import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";

export function CreateProjectModal({ open, onClose, onCreate, loading }) {
  const api = useApi();
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [form, setForm] = useState({
    client: "",
    title: "",
    description: ""
  });

  useEffect(() => {
    if (!open) return;
    setClientsLoading(true);
    api
      .get("/clients/")
      .then((response) => {
        setClients(response.data);
      })
      .finally(() => {
        setClientsLoading(false);
      });
  }, [api, open]);

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onCreate(form, () => {
      setForm({ client: "", title: "", description: "" });
    });
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-black/50">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">
            New project
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
            <label
              className="block text-xs font-medium text-slate-300"
              htmlFor="client"
            >
              Client
            </label>
            <select
              id="client"
              name="client"
              className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/20 focus:ring"
              value={form.client}
              onChange={handleChange}
              required
            >
              <option value="">
                {clientsLoading ? "Loading clients..." : "Select a client"}
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label
              className="block text-xs font-medium text-slate-300"
              htmlFor="title"
            >
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/20 focus:ring"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label
              className="block text-xs font-medium text-slate-300"
              htmlFor="description"
            >
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full resize-none rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/20 focus:ring"
              value={form.description}
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-md bg-emerald-500/80 px-3 py-2 text-sm font-medium text-slate-900 shadow-sm shadow-emerald-500/30 ring-emerald-500/40 transition hover:bg-emerald-400/80 focus-visible:outline-none focus-visible:ring disabled:cursor-not-allowed disabled:bg-emerald-500/40"
          >
            {loading ? "Creating..." : "Create project"}
          </button>
        </form>
      </div>
    </div>
  );
}

