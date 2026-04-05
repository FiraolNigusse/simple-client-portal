const STATUS_STYLES = {
  pending: {
    dot: "bg-portal-warning shadow-[0_0_8px_var(--warning)]",
    badge: "border-portal-warning/20 bg-portal-warning/10 text-portal-warning",
    label: "Pending",
  },
  paid: {
    dot: "bg-portal-success shadow-[0_0_8px_var(--success)]",
    badge: "border-portal-success/20 bg-portal-success/10 text-portal-success",
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
      className={`group relative rounded-xl border bg-surface p-5 transition-all hover:bg-white/[0.03]
        ${overdue ? "border-portal-error/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]" : "border-white/[0.05]"}
      `}
    >
      {/* Overdue ribbon */}
      {overdue && (
        <span className="absolute right-4 top-4 rounded-full border border-portal-error/30 bg-portal-error/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-portal-error">
          Overdue
        </span>
      )}

      <div className="flex items-start justify-between gap-4">
        {/* Left — Invoice info */}
        <div className="min-w-0 space-y-2">
          {/* Invoice number + status */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-portal-muted">
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
          <p className="truncate text-base font-semibold text-portal-text">
            {invoice.client_name || `Client #${invoice.client}`}
          </p>

          {/* Project */}
          {invoice.project_title && (
            <p className="text-xs text-portal-muted">
              Project:{" "}
              <span className="text-portal-text/80">{invoice.project_title}</span>
            </p>
          )}

          {/* Dates */}
          <p className="text-xs text-portal-muted">
            Issued {formatDate(invoice.created_at)}
            {invoice.due_date && (
              <>
                {" · "}
                <span className={overdue ? "text-portal-error font-bold" : ""}>
                  Due {formatDate(invoice.due_date)}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Right — Amount + action */}
        <div className="flex shrink-0 flex-col items-end gap-3">
          <p className="text-xl font-bold tracking-tight text-portal-text shadow-primary/20">
            {formatCurrency(invoice.amount)}
          </p>

          {invoice.status === "pending" && onMarkPaid && (
            <button
              type="button"
              onClick={() => onMarkPaid(invoice)}
              className="rounded-lg border border-portal-success/30 bg-portal-success/10 px-3 py-1.5 text-xs font-medium text-portal-success transition-all hover:bg-portal-success hover:text-white"
            >
              Mark as paid
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
