import LoadingSpinner from "./LoadingSpinner";

function ResultsPanel({ result, loading }) {
  // Loading state
  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
              <svg className="w-4 h-4 text-amber-400 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
            </span>
            <div>
              <h2 className="text-lg font-semibold text-white/90">Results</h2>
              <p className="text-xs text-white/40 mt-0.5">Executing query...</p>
            </div>
          </div>
          <LoadingSpinner size="sm" label="Loading" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="skeleton h-4 flex-1" />
              <div className="skeleton h-4 flex-1" />
              <div className="skeleton h-4 flex-[0.5]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (result?.error) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-fade-in-up border-red-500/10">
        <div className="flex items-center gap-3 mb-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20">
            <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white/90">Results</h2>
            <p className="text-xs text-white/40 mt-0.5">Query returned an error</p>
          </div>
        </div>
        <div className="text-red-300/90 font-mono text-sm bg-red-500/5 border border-red-500/10 p-4 rounded-xl">
          {result.error}
        </div>
      </div>
    );
  }

  // Empty state
  if (!result) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
            <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white/90">Results</h2>
            <p className="text-xs text-white/40 mt-0.5">Query results will appear here</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-4xl mb-4 opacity-20">📊</div>
          <h3 className="text-base font-medium text-white/40">No Results Yet</h3>
          <p className="text-sm text-white/20 mt-1">Generate SQL and execute a query</p>
        </div>
      </div>
    );
  }

  const rows = result.rows || [];

  // No rows returned
  if (rows.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
              <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </span>
            <div>
              <h2 className="text-lg font-semibold text-white/90">Results</h2>
            </div>
          </div>
        </div>
        <div className="text-white/40 text-sm">No rows returned.</div>
      </div>
    );
  }

  // Invalid format
  if (!rows[0] || typeof rows[0] !== "object") {
    return (
      <div className="glass-card rounded-2xl p-6 animate-fade-in-up  border-red-500/10">
        <div className="flex items-center gap-3 mb-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20">
            <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white/90">Results</h2>
          </div>
        </div>
        <div className="text-red-300/90 text-sm">Invalid response format received from backend.</div>
      </div>
    );
  }

  const columns = Object.keys(rows[0]);

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white/90">Results</h2>
          </div>
        </div>
        <span className="text-xs text-white/30 bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1">
          {rows.length} {rows.length === 1 ? "row" : "rows"}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/[0.04]">
        <table className="glass-table w-full text-sm">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} className="text-left">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className="transition-colors duration-200"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {columns.map((column) => (
                  <td key={column}>
                    {row ? String(row[column]) : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ResultsPanel;
