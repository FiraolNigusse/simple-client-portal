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
    <div className="divide-y divide-slate-800 rounded-lg border border-slate-800 bg-slate-950/40">
      {clients.map((client) => (
        <Link
          key={client.id}
          to={`/clients/${client.id}`}
          className="flex items-center justify-between px-4 py-3 hover:bg-slate-900/60"
        >
          <div>
            <p className="text-sm font-medium text-slate-100">{client.name}</p>
            <p className="text-xs text-slate-400">
              {client.email}
              {client.company ? ` • ${client.company}` : ""}
            </p>
          </div>
          <span className="text-xs text-emerald-400">View</span>
        </Link>
      ))}
    </div>
  );
}

