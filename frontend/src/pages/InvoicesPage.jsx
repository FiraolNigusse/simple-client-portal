import { useEffect, useState } from "react";
import * as api from "../services/api";
import { Table } from "../components/ui/Table";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Badge } from "../components/ui/Badge";
import { useToast } from "../context/ToastContext";
import { UpgradeBanner } from "../components/UpgradeBanner";

export function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({ 
    client: "", 
    project: "", 
    amount: "", 
    due_date: new Date().toISOString().split('T')[0] 
  });
  
  const toast = useToast();

  useEffect(() => {
    Promise.all([api.getInvoices(), api.getClients(), api.getProjects()])
      .then(([invRes, clientRes, projRes]) => {
        setInvoices(invRes.data);
        setClients(clientRes.data);
        setProjects(projRes.data);
      })
      .catch(() => toast("Failed to load data.", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.client || !formData.amount) return toast("Missing required fields.", "warning");
    
    setCreating(true);
    setFormError(null);
    try {
      const res = await api.createInvoice(formData);
      setInvoices([res.data, ...invoices]);
      setModalOpen(false);
      setFormData({ client: "", project: "", amount: "", due_date: new Date().toISOString().split('T')[0] });
      toast("Invoice sent!");
    } catch (err) {
      if (err.response?.data?.code === "plan_limit_reached") {
        setFormError(err.response.data);
      } else {
        toast("Error creating invoice.", "error");
      }
    } finally {
      setCreating(false);
    }
  };

  const filteredProjects = projects.filter(p => !formData.client || p.client === parseInt(formData.client));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-portal-text uppercase tracking-[0.1em]">Invoices</h2>
          <p className="text-sm text-portal-muted font-medium">Manage your billing and payments.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Create Invoice
        </Button>
      </div>

      <Table 
        headers={["Invoice", "Client", "Project", "Amount", "Due Date", "Status"]} 
        loading={loading}
      >
        {invoices.map(inv => (
          <tr key={inv.id} className="hover:bg-white/5 transition-all duration-300 cursor-pointer border-b border-white/5 last:border-0 group">
            <td className="px-6 py-5 font-black text-portal-text tracking-tighter group-hover:text-accent">#{inv.id}</td>
            <td className="px-6 py-5 text-portal-text font-bold">{inv.client_name}</td>
            <td className="px-6 py-5 text-portal-muted font-medium opacity-80">{inv.project_title || "General Billing"}</td>
            <td className="px-6 py-5 font-black text-portal-text">${inv.amount}</td>
            <td className="px-6 py-5 text-portal-muted font-black tracking-widest text-[10px] uppercase opacity-60">
              {new Date(inv.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </td>
            <td className="px-6 py-5">
              <Badge variant={inv.status === "paid" ? "success" : "warning"}>
                {inv.status}
              </Badge>
            </td>
          </tr>
        ))}
      </Table>

      {/* Create Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Create New Invoice"
        footer={(
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={creating}>Generate & Send</Button>
          </>
        )}
      >
        <form onSubmit={handleCreate} className="space-y-4 py-2">
          {formError && (
            <UpgradeBanner 
              resource={formError.resource} 
              limit={formError.limit} 
              plan={formError.plan} 
            />
          )}
          <Select 
            label="Client" 
            required 
            value={formData.client}
            onChange={e => setFormData({...formData, client: e.target.value, project: ""})}
          >
            <option value="">Select a client...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          
          <Select 
            label="Project (Optional)" 
            value={formData.project}
            onChange={e => setFormData({...formData, project: e.target.value})}
            disabled={!formData.client}
          >
            <option value="">Select a project...</option>
            {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Amount ($)" 
              type="number" 
              placeholder="0.00" 
              required 
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
            />
            <Input 
              label="Due Date" 
              type="date" 
              required 
              value={formData.due_date}
              onChange={e => setFormData({...formData, due_date: e.target.value})}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
