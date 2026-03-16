import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { Modal } from "./ui/Modal";
import { Input, Select } from "./ui/Input";
import { Button } from "./ui/Button";

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

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Generate Invoice"
      footer={(
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={submitting}>Send Invoice</Button>
        </>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-6 py-2">
        <Select
          label="Client"
          name="client"
          value={form.client}
          onChange={handleChange}
          required
        >
          <option value="">Select a client…</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Select
          label="Project (Optional)"
          name="project"
          value={form.project}
          onChange={handleChange}
          disabled={!form.client || projects.length === 0}
        >
          <option value="">None</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </Select>

        <Input
          label="Amount (USD)"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={form.amount}
          onChange={handleChange}
          required
        />

        <Input
          label="Due Date (Optional)"
          name="due_date"
          type="date"
          value={form.due_date}
          onChange={handleChange}
        />

        {error && (
          <p className="rounded-xl border border-portal-error/20 bg-portal-error/10 px-4 py-3 text-xs text-portal-error font-medium">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}

