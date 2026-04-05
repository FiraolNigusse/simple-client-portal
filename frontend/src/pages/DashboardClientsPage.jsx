import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
      setClients(Array.isArray(res.data) ? res.data : res.data.results || []);
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
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">Clients</h2>
          <p className="text-sm text-[#8B93A1]">Manage your client relationships and portals.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
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
            <div key={client.id} className="fin-card p-6 flex flex-col group relative transition-all">
              <div className="mb-6 flex items-start justify-between">
                <div className="h-10 w-10 rounded bg-white/5 flex items-center justify-center text-sm font-semibold text-white">
                  {client.name[0].toUpperCase()}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleDelete(client.id);
                    }} 
                    className="p-1.5 text-[#8B93A1] hover:text-red-400 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold tracking-tight text-white mb-1">{client.name}</h3>
              <p className="text-xs text-[#8B93A1] mb-6">{client.company || "Independent Business"}</p>
              
              <div className="space-y-4 border-t border-white/[0.04] pt-6 mt-auto">
                <div className="flex items-center gap-3 text-xs text-[#8B93A1]">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{client.email}</span>
                </div>
                {client.projects_count !== undefined && (
                  <div className="flex items-center justify-between">
                    <Badge variant="default" className="text-[11px]">
                      {client.projects_count || 0} PROJECTS
                    </Badge>
                  </div>
                )}
              </div>
              
              <Link 
                to={`/clients/${client.id}`} 
                className="absolute inset-0 z-0" 
                aria-label="View Client" 
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="fin-card flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-6 rounded-full bg-white/[0.02] p-6 text-[#8B93A1]">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white">No clients found</h3>
          <p className="max-w-xs text-sm text-[#8B93A1] mt-2 mb-8">Start by adding your first client to create projects and send invoices.</p>
          <Button onClick={() => setModalOpen(true)}>Add Client</Button>
        </div>
      )}

      {/* Create Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title="New Client"
        footer={(
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={creating}>Create Client</Button>
          </div>
        )}
      >
        <form onSubmit={handleCreate} className="space-y-6 py-4">
          {formError && (
            <div className="mb-4">
              <UpgradeBanner 
                resource={formError.resource} 
                limit={formError.limit} 
                plan={formError.plan} 
              />
            </div>
          )}
          <Input 
            label="Name" 
            placeholder="e.g. John Doe" 
            required 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <Input 
            label="Email" 
            type="email" 
            placeholder="john@example.com" 
            required 
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <Input 
            label="Company" 
            placeholder="e.g. Acme Corp" 
            value={formData.company}
            onChange={e => setFormData({...formData, company: e.target.value})}
          />
        </form>
      </Modal>
    </div>
  );
}
