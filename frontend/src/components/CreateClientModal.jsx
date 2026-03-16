import { useState } from "react";
import { UpgradeBanner } from "./UpgradeBanner";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

export function CreateClientModal({ open, onClose, onCreate, loading }) {
  const [form, setForm] = useState({ name: "", email: "", company: "" });
  const [planError, setPlanError] = useState(null);

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
      const code = err?.response?.data?.code;
      if (code === "plan_limit_reached") {
        setPlanError(err.response.data);
      }
    });
  };

  return (
    <Modal 
      isOpen={open} 
      onClose={onClose} 
      title="Create New Client"
      footer={(
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={loading} disabled={Boolean(planError)}>Add Client</Button>
        </>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-6 py-2">
        <Input 
          label="Full Name" 
          name="name"
          placeholder="e.g. John Doe" 
          required 
          value={form.name}
          onChange={handleChange}
        />
        <Input 
          label="Email Address" 
          name="email"
          type="email"
          placeholder="john@example.com" 
          required 
          value={form.email}
          onChange={handleChange}
        />
        <Input 
          label="Company (Optional)" 
          name="company"
          placeholder="e.g. Acme Corp" 
          value={form.company}
          onChange={handleChange}
        />
        {planError && (
          <UpgradeBanner resource="clients" onDismiss={() => setPlanError(null)} />
        )}
      </form>
    </Modal>
  );
}


