import LoadingSpinner from "./LoadingSpinner";

function ResultsPanel({ result, loading }) {
  const rows = result?.rows || [];
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  const exportToCSV = () => {
    if (rows.length === 0) return;
    const csvContent = [
      columns.join(","),
      ...rows.map((row) =>
        columns.map((col) => `"${String(row[col] ?? "").replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "query_results.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasData = rows.length > 0;
  const hasError = !!result?.error;
  const isEmpty = !result && !loading;

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
      {/* Header (Always Visible) */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <svg
              className="w-4 h-4 text-emerald-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </span>
          <div>
            <h2 className="text-sm font-semibold text-white/90">Results</h2>
            <p className="text-[11px] text-white/40 mt-0.5">
              {loading
                ? "Executing query..."
                : hasError
                ? "Query returned an error"
                : hasData
                ? `${rows.length} ${rows.length === 1 ? "row" : "rows"} returned`
                : "Query output appears here"}
            </p>
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={exportToCSV}
          disabled={!hasData || loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Export</span>
        </button>
      </div>

      {/* Body States */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="skeleton h-4 flex-1" />
              <div className="skeleton h-4 flex-1" />
              <div className="skeleton h-4 flex-[0.5]" />
            </div>
          ))}
        </div>
      )}

      {hasError && !loading && (
        <div className="text-red-300/90 font-mono text-xs bg-red-500/5 border border-red-500/10 p-4 rounded-xl whitespace-pre-wrap">
          {result.error}
        </div>
      )}

      {isEmpty && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.02] border border-white/[0.04] mb-4 text-white/20">
            {/* Crossed-out table grid icon */}
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="15" y1="3" x2="15" y2="21" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
              <line x1="3" y1="3" x2="21" y2="21" strokeWidth="2.5" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-white/60">No results yet</h3>
          <p className="text-xs text-white/30 mt-1">Run a query above to see output here</p>
        </div>
      )}

      {result && !loading && !hasError && rows.length === 0 && (
        <div className="text-white/40 text-xs py-4 text-center italic">
          No rows returned from database.
        </div>
      )}

      {hasData && !loading && !hasError && (
        <div className="overflow-x-auto rounded-xl border border-white/[0.04] bg-[#0A0614]/30">
          <table className="glass-table w-full text-xs">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column} className="text-left font-semibold text-white/50 text-[10px] tracking-wider uppercase">
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
                    <td key={column} className="text-white/80">
                      {row && row[column] !== null && row[column] !== undefined
                        ? String(row[column])
                        : <span className="opacity-20 italic">null</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ResultsPanel;
