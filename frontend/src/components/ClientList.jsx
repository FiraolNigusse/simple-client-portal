import { Link } from "react-router-dom";

export function ClientList({ clients }) {
  if (!clients.length) {
    return (
      <p className="text-sm text-[#8B93A1]">
        No clients yet.
      </p>
    );
  }

  return (
    <div className="fin-card divide-y divide-white/[0.04] overflow-hidden">
      {clients.map((client) => (
        <Link
          key={client.id}
          to={`/clients/${client.id}`}
          className="flex items-center justify-between px-6 py-4 list-row-hover transition-colors"
        >
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">{client.name}</p>
            <p className="text-xs text-[#8B93A1]">
              {client.email}
              {client.company ? ` • ${client.company}` : ""}
            </p>
          </div>
          <span className="text-[11px] font-medium text-[#8B93A1] uppercase tracking-wider group-hover:text-white transition-colors">View</span>
        </Link>
      ))}
    </div>
  );
}

