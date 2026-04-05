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
  const overdue = isOverdue(invoice);

  return (
    <div
      className={`fin-card p-5 group flex items-start justify-between gap-4 ${
        overdue ? "border-red-500/20" : ""
      }`}
    >
      <div className="min-w-0 space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium text-[#8B93A1]">
            #{String(invoice.id).padStart(4, "0")}
          </span>
          <span className={`status-badge ${invoice.status === "paid" ? "status-active" : "status-pending"}`}>
            {invoice.status.toUpperCase()}
          </span>
          {overdue && (
            <span className="status-badge text-red-400">
              OVERDUE
            </span>
          )}
        </div>

        <div>
          <p className="truncate text-base font-semibold text-white">
            {invoice.client_name || `Client #${invoice.client}`}
          </p>
          {invoice.project_title && (
            <p className="text-xs text-[#8B93A1] mt-0.5">
              {invoice.project_title}
            </p>
          )}
        </div>

        <p className="text-[11px] text-[#8B93A1]">
          {formatDate(invoice.created_at)}
          {invoice.due_date && (
            <>
              {" · "}
              <span className={overdue ? "text-red-400 font-medium" : ""}>
                Due {formatDate(invoice.due_date)}
              </span>
            </>
          )}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-4">
        <p className="text-2xl font-semibold tracking-tight text-white">
          {formatCurrency(invoice.amount)}
        </p>

        {invoice.status === "pending" && onMarkPaid && (
          <button
            type="button"
            onClick={() => onMarkPaid(invoice)}
            className="btn-secondary !py-1.5 !px-3 !text-xs"
          >
            Mark Paid
          </button>
        )}
      </div>
    </div>
  );
}

