const STATUS_STYLES = {
  pending: {
    dot: "bg-amber-400",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    label: "Pending",
  },
  paid: {
    dot: "bg-emerald-400",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    label: "Paid",
  },
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const isOverdue = (invoice) =>
  invoice.status === "pending" &&
  invoice.due_date &&
  new Date(invoice.due_date) < new Date();

export function InvoiceCard({ invoice, onMarkPaid }) {
  const style = STATUS_STYLES[invoice.status] ?? STATUS_STYLES.pending;
  const overdue = isOverdue(invoice);

  return (
    <div
      className={`group relative rounded-xl border bg-slate-950/50 p-5 transition-all hover:border-slate-600
        ${overdue ? "border-red-500/40" : "border-slate-800"}
      `}
    >
      {/* Overdue ribbon */}
      {overdue && (
        <span className="absolute right-4 top-4 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-400">
          Overdue
        </span>
      )}

      <div className="flex items-start justify-between gap-4">
        {/* Left — Invoice info */}
        <div className="min-w-0 space-y-2">
          {/* Invoice number + status */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500">
              #{String(invoice.id).padStart(4, "0")}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${style.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
              {style.label}
            </span>
          </div>

          {/* Client name */}
          <p className="truncate text-base font-semibold text-slate-100">
            {invoice.client_name || `Client #${invoice.client}`}
          </p>

          {/* Project */}
          {invoice.project_title && (
            <p className="text-xs text-slate-500">
              Project:{" "}
              <span className="text-slate-400">{invoice.project_title}</span>
            </p>
          )}

          {/* Dates */}
          <p className="text-xs text-slate-600">
            Issued {formatDate(invoice.created_at)}
            {invoice.due_date && (
              <>
                {" · "}
                <span className={overdue ? "text-red-400" : ""}>
                  Due {formatDate(invoice.due_date)}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Right — Amount + action */}
        <div className="flex shrink-0 flex-col items-end gap-3">
          <p className="text-xl font-bold tracking-tight text-slate-50">
            {formatCurrency(invoice.amount)}
          </p>

          {invoice.status === "pending" && onMarkPaid && (
            <button
              type="button"
              onClick={() => onMarkPaid(invoice)}
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-all hover:bg-emerald-500/20 hover:border-emerald-400/50"
            >
              Mark as paid
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
