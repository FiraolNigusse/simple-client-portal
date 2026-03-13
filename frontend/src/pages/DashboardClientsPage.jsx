import { useEffect, useState } from "react";
import * as api from "../services/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Badge, Skeleton } from "../components/ui/Badge";
import { useToast } from "../context/ToastContext";
import { UpgradeBanner } from "../components/UpgradeBanner";

export function DashboardClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", company: "" });
  const [formError, setFormError] = useState(null);
  
  const toast = useToast();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.getClients();
      setClients(res.data);
    } catch (err) {
      toast("Failed to load clients.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setFormError(null);
    try {
      const res = await api.createClient(formData);
      setClients([res.data, ...clients]);
      setModalOpen(false);
      setFormData({ name: "", email: "", company: "" });
      toast("Client created successfully!");
    } catch (err) {
      if (err.response?.data?.code === "plan_limit_reached") {
        setFormError(err.response.data);
      } else {
        toast("Error creating client.", "error");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This will delete all projects linked to this client.")) return;
    try {
      await api.deleteClient(id);
      setClients(clients.filter(c => c.id !== id));
      toast("Client deleted.");
    } catch (err) {
      toast("Failed to delete client.", "error");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-portal-text">Clients</h2>
          <p className="text-sm text-portal-muted">Manage your client relationships and portals.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add Client
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <Skeleton key={i} height="180px" />)}
        </div>
      ) : clients.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clients.map(client => (
            <Card key={client.id} className="group relative border-slate-800/50 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5">
              <div className="mb-4 flex items-start justify-between">
                <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center text-lg font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  {client.name[0]}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(client.id)} className="text-portal-error hover:bg-portal-error/10">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-portal-text">{client.name}</h3>
              <p className="text-sm text-portal-muted mb-4">{client.company || "Independent"}</p>
              
              <div className="space-y-2 border-t border-slate-800 pt-4">
                <div className="flex items-center gap-2 text-xs text-portal-muted">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {client.email}
                </div>
                {client.projects_count !== undefined && (
                  <div className="mt-2">
                    <Badge variant="indigo">{client.projects_count || 0} Projects</Badge>
                  </div>
                )}
              </div>
              
              <a 
                href={`/clients/${client.id}`} 
                className="absolute inset-0 z-0" 
                aria-label="View Client" 
              />
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-20 text-center">
          <div className="mb-4 rounded-full bg-slate-800/50 p-6">
            <svg className="h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-portal-text">No clients yet</h3>
          <p className="max-w-xs text-sm text-portal-muted mb-6">Start by adding your first client to create projects and send invoices.</p>
          <Button onClick={() => setModalOpen(true)}>Add your first client</Button>
        </Card>
      )}

      {/* Create Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Add New Client"
        footer={(
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={creating}>Create Client</Button>
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
          <Input 
            label="Full Name" 
            placeholder="e.g. John Doe" 
            required 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="john@example.com" 
            required 
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <Input 
            label="Company Name" 
            placeholder="e.g. Acme Corp" 
            value={formData.company}
            onChange={e => setFormData({...formData, company: e.target.value})}
          />
        </form>
      </Modal>
    </div>
  );
}
