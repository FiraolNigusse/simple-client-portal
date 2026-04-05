import { useEffect, useState } from "react";
import * as api from "../services/api";
import { Table } from "../components/ui/Table";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { useToast } from "../context/ToastContext";
import { CreateInvoiceModal } from "../components/CreateInvoiceModal";

export function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  const toast = useToast();

  useEffect(() => {
    api.getInvoices()
      .then((invRes) => {
        setInvoices(Array.isArray(invRes.data) ? invRes.data : invRes.data.results || []);
      })
      .catch(() => toast("Failed to load invoices.", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = (newInvoice) => {
    setInvoices([newInvoice, ...invoices]);
    toast("Invoice generated and sent!");
  };

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
            <td className="px-6 py-5 font-black text-portal-text tracking-tighter group-hover:text-primary">#{inv.id}</td>
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

      <CreateInvoiceModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onCreate={handleCreate} 
      />
    </div>
  );
}

