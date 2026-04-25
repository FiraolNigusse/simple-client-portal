import { useEffect, useState } from "react";
import * as api from "../services/api";
import { Table } from "../components/ui/Table";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { StatsCard } from "../components/ui/Card";
import { useToast } from "../context/ToastContext";
import { CreateInvoiceModal } from "../components/CreateInvoiceModal";

const icons = {
  money: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  trend: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  alert: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
};

export function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  const toast = useToast();

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getInvoices(),
      api.getInvoiceMetrics()
    ])
      .then(([invRes, metRes]) => {
        setInvoices(Array.isArray(invRes.data) ? invRes.data : invRes.data.results || []);
        setMetrics(metRes.data);
      })
      .catch(() => toast("Failed to load invoices.", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = (newInvoice) => {
    setInvoices([newInvoice, ...invoices]);
    toast("Invoice generated successfully!");
    loadData(); // Refresh metrics
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "paid": return "success";
      case "overdue": return "error";
      case "partial": return "warning";
      case "sent": return "info";
      default: return "default";
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      const res = await api.generateInvoicePDF(id);
      window.open(res.data.pdf_url, '_blank');
      toast("PDF opened in new tab");
    } catch (err) {
      toast("Failed to generate PDF", "error");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">Invoices</h2>
          <p className="text-sm text-[#8B93A1]">Professional financial workflow and tracking.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Invoice
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          label="Outstanding Balance" 
          value={`$${metrics?.total_outstanding || 0}`} 
          icon={icons.money} 
        />
        <StatsCard 
          label="Overdue" 
          value={`$${metrics?.overdue_balance || 0}`} 
          icon={icons.alert} 
          trend={{ value: metrics?.overdue_balance > 0 ? "Urgent" : "Good", color: metrics?.overdue_balance > 0 ? "red" : "green" }}
        />
        <StatsCard 
          label="Paid This Month" 
          value={`$${metrics?.paid_this_month || 0}`} 
          icon={icons.trend} 
        />
        <StatsCard 
          label="Collection Rate" 
          value={`${metrics?.collection_rate || 0}%`} 
          icon={icons.trend} 
        />
      </div>

      <Table 
        headers={["Number", "Client", "Amount", "Balance", "Due Date", "Status", "Actions"]} 
        loading={loading}
      >
        {invoices.map(inv => (
          <tr key={inv.id} className="list-row-hover group">
            <td className="px-6 py-5">
              <div className="flex flex-col">
                <span className="font-semibold text-white tracking-tight">{inv.invoice_number}</span>
                {inv.is_demo_data && <span className="text-[10px] text-yellow-500/70 font-bold uppercase tracking-widest mt-1">Demo Data</span>}
              </div>
            </td>
            <td className="px-6 py-5">
              <div className="flex flex-col">
                <span className="text-white font-medium">{inv.client_name}</span>
                <span className="text-[11px] text-[#8B93A1]">{inv.project_title || "General Billing"}</span>
              </div>
            </td>
            <td className="px-6 py-5 font-semibold text-white">${inv.total_amount}</td>
            <td className="px-6 py-5">
                <span className={`font-semibold ${inv.balance_due > 0 ? "text-red-400" : "text-green-400"}`}>
                    ${inv.balance_due}
                </span>
            </td>
            <td className="px-6 py-5 text-[#8B93A1] text-xs">
              {inv.due_date ? new Date(inv.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
            </td>
            <td className="px-6 py-5">
              <Badge variant={getStatusVariant(inv.status)}>
                {inv.status.toUpperCase()}
              </Badge>
            </td>
            <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleDownloadPDF(inv.id)}>PDF</Button>
                    {inv.payment_link && <Button variant="ghost" size="sm" onClick={() => window.open(`/pay/${inv.uuid}`, '_blank')}>Link</Button>}
                </div>
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
