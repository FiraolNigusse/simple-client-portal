import { Link } from "react-router-dom";

export function ClientList({ clients }) {
  if (!clients.length) {
    return (
      <p className="text-sm text-slate-400">
        You don&apos;t have any clients yet. Create your first client to generate a portal link.
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-50 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {clients.map((client) => (
        <Link
          key={client.id}
          to={`/clients/${client.id}`}
          className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <div>
            <p className="text-sm font-bold text-portal-text">{client.name}</p>
            <p className="text-xs text-portal-muted font-medium">
              {client.email}
              {client.company ? ` • ${client.company}` : ""}
            </p>
          </div>
          <span className="text-xs font-bold text-primary uppercase tracking-widest">View</span>
        </Link>
      ))}
    </div>
  );
}

