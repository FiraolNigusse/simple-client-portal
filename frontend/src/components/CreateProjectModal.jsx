import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import { Modal } from "./ui/Modal";
import { Input, Select } from "./ui/Input";
import { Button } from "./ui/Button";

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
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Create Workspace"
      footer={(
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={loading}>Deploy Project</Button>
        </>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-6 py-2">
        <Select
          label="Associate Client"
          name="client"
          value={form.client}
          onChange={handleChange}
          required
        >
          <option value="">
            {clientsLoading ? "Loading database..." : "Select client reference"}
          </option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </Select>

        <Input 
          label="Project Title" 
          name="title"
          placeholder="e.g. Q3 Brand Refresh" 
          required 
          value={form.title}
          onChange={handleChange}
        />

        <div className="space-y-2">
            <label className="text-[10px] font-black text-portal-muted uppercase tracking-[0.2em] ml-2">
                Operational Brief (Optional)
            </label>
            <textarea
              name="description"
              rows={4}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-portal-text transition-all placeholder:text-portal-muted/40 focus:bg-white/10 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/50"
              placeholder="Define project score and deliverables..."
              value={form.description}
              onChange={handleChange}
            />
        </div>
      </form>
    </Modal>
  );
}


