export function Table({ headers, children, loading = false, rowCount = 5 }) {
  return (
    <div className="overflow-x-auto custom-scrollbar rounded-xl border border-white/10 bg-surface shadow-2xl shadow-black/20">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-white/10 bg-white/[0.02] text-[10px] font-black text-portal-muted uppercase tracking-[0.2em]">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className={`px-6 py-4 ${i === 0 ? "pl-8" : ""}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {loading ? (
            Array.from({ length: rowCount }).map((_, i) => (
              <tr key={i}>
                {headers.map((_, j) => (
                  <td key={j} className="px-6 py-5">
                    <div className="h-4 w-full animate-pulse rounded bg-white/5" />
                  </td>
                ))}
              </tr>
            ))
          ) : children ? (
            children
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-6 py-16 text-center text-portal-muted font-medium">
                No data available in this view.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
