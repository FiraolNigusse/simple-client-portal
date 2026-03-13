import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import { InvoiceCard } from "../components/InvoiceCard";
import { CreateInvoiceModal } from "../components/CreateInvoiceModal";

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "paid", label: "Paid" },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export function InvoicesPage() {
  const api = useApi();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);

  const fetch = useCallback(() => {
    setLoading(true);
    api
      .get("/invoices/")
      .then((r) => {
        const data = r.data;
        setInvoices(Array.isArray(data) ? data : data.results ?? []);
      })
      .finally(() => setLoading(false));
  }, [api]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleCreate = (invoice) => {
    setInvoices((prev) => [invoice, ...prev]);
  };

  const handleMarkPaid = async (invoice) => {
    try {
      const response = await api.patch(`/invoices/${invoice.id}/`, { status: "paid" });
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoice.id ? response.data : inv))
      );
    } catch {
      // silent fail — could add a toast here later
    }
  };

  const filtered =
    tab === "all" ? invoices : invoices.filter((inv) => inv.status === tab);

  // Stats
  const total = invoices.reduce((s, inv) => s + parseFloat(inv.amount ?? 0), 0);
  const pending = invoices
    .filter((inv) => inv.status === "pending")
    .reduce((s, inv) => s + parseFloat(inv.amount ?? 0), 0);
  const paid = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((s, inv) => s + parseFloat(inv.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            Invoices
          </h1>
          <p className="text-sm text-slate-400">
            Manage and track payments from your clients.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600/80 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-emerald-500/20 hover:bg-emerald-500/80"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New invoice
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total invoiced", value: formatCurrency(total), color: "text-slate-50" },
          { label: "Pending", value: formatCurrency(pending), color: "text-amber-400" },
          { label: "Collected", value: formatCurrency(paid), color: "text-emerald-400" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-800 bg-slate-950/50 px-5 py-4"
          >
            <p className="text-xs text-slate-500">{label}</p>
            <p className={`mt-1 text-2xl font-bold tracking-tight ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/40 p-1 w-fit">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-md px-4 py-1.5 text-xs font-medium transition-all ${
              tab === key
                ? "bg-slate-800 text-slate-100 shadow-sm"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {label}
            <span className={`ml-1.5 text-[10px] font-normal ${tab === key ? "text-slate-400" : "text-slate-600"}`}>
              {key === "all"
                ? invoices.length
                : invoices.filter((inv) => inv.status === key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Invoice list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-28 animate-pulse rounded-xl border border-slate-800 bg-slate-950/40"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-800 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300">No invoices yet</p>
            <p className="text-xs text-slate-600">
              {tab === "all"
                ? "Create your first invoice to get started."
                : `No ${tab} invoices found.`}
            </p>
          </div>
          {tab === "all" && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20"
            >
              Create invoice
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onMarkPaid={handleMarkPaid}
            />
          ))}
        </div>
      )}

      <CreateInvoiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
