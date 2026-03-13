import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import { ClientList } from "../components/ClientList";
import { CreateClientModal } from "../components/CreateClientModal";

export function DashboardClientsPage() {
  const api = useApi();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    api
      .get("/clients/")
      .then((response) => {
        setClients(response.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [api]);

  const handleCreateClient = async (data, resetForm) => {
    setCreating(true);
    try {
      const response = await api.post("/clients/", data);
      setClients((prev) => [response.data, ...prev]);
      resetForm();
      setModalOpen(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            Clients
          </h1>
          <p className="text-sm text-slate-400">
            Manage the clients who have access to their own portal.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center rounded-md bg-emerald-500/80 px-3 py-2 text-xs font-medium text-slate-900 shadow-sm shadow-emerald-500/30 hover:bg-emerald-400/80"
        >
          New client
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-slate-400">Loading clients...</p>
      ) : (
        <ClientList clients={clients} />
      )}
      <CreateClientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateClient}
        loading={creating}
      />
    </div>
  );
}

