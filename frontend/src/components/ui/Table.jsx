export function Table({ headers, children, loading = false, rowCount = 5 }) {
  return (
    <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-100 bg-gray-50/50 text-[10px] font-bold text-portal-muted uppercase tracking-widest">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className={`px-6 py-4 ${i === 0 ? "pl-6" : ""}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            Array.from({ length: rowCount }).map((_, i) => (
              <tr key={i}>
                {headers.map((_, j) => (
                  <td key={j} className="px-6 py-4">
                    <div className="h-4 w-full animate-shimmer rounded-lg bg-gray-100" />
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
