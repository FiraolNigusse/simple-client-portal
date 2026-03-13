export function Table({ headers, children, loading = false, rowCount = 5 }) {
  return (
    <div className="overflow-x-auto custom-scrollbar rounded-xl border border-slate-800 bg-surface">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-800 bg-[#0B1220]/50 text-xs font-semibold text-portal-muted uppercase tracking-wider">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className={`px-6 py-4 ${i === 0 ? "pl-6" : ""}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {loading ? (
            Array.from({ length: rowCount }).map((_, i) => (
              <tr key={i}>
                {headers.map((_, j) => (
                  <td key={j} className="px-6 py-4">
                    <div className="h-4 w-full animate-shimmer rounded bg-slate-800" />
                  </td>
                ))}
              </tr>
            ))
          ) : children ? (
            children
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-6 py-12 text-center text-portal-muted">
                No results found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
