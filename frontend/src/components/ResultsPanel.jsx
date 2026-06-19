function ResultsPanel({ result }) {
  // Check for explicit error fields caught from backend payload
  if (result?.error) {
    return (
      <div className="bg-[#111827] border border-red-700 rounded-xl p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Results
        </h2>

        <div className="text-red-400 font-mono text-sm bg-red-950/30 p-4 border border-red-900/50 rounded-lg">
          {result.error}
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-[#111827] border border-slate-700 rounded-xl p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Results
        </h2>

        <div className="flex flex-col items-center justify-center py-12">

          <div className="text-6xl">
            📊
          </div>

          <h3 className="text-lg font-semibold mt-3 text-slate-200">
            No Results Yet
          </h3>

          <p className="text-slate-400 mt-2">
            Generate SQL and execute a query
          </p>

        </div>
      </div>
    );
  }

  const rows = result.rows || [];

  if (rows.length === 0) {
    return (
      <div className="bg-[#111827] border border-slate-700 rounded-xl p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Results
        </h2>

        <div className="text-slate-400">
          No rows returned.
        </div>
      </div>
    );
  }

  if (!rows[0] || typeof rows[0] !== "object") {
    return (
      <div className="bg-[#111827] border border-slate-700 rounded-xl p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Results
        </h2>

        <div className="text-red-400">
          Invalid response format received from backend.
        </div>
      </div>
    );
  }

  const columns = Object.keys(rows[0]);

  return (
    <div className="bg-[#111827] border border-slate-700 rounded-xl p-6 mt-6">

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">
          Results
        </h2>

        <span className="text-sm text-slate-400">
          {rows.length} {rows.length === 1 ? "row" : "rows"}
        </span>
      </div>

      <div className="overflow-x-auto">

        <table className="w-full text-sm">

          <thead>
            <tr className="border-b border-slate-700">

              {columns.map((column) => (
                <th
                  key={column}
                  className="text-left py-3 px-4 font-semibold text-slate-300"
                >
                  {column}
                </th>
              ))}

            </tr>
          </thead>

          <tbody>

            {rows.map((row, index) => (
              <tr
                key={index}
                className="border-b border-slate-800 last:border-none hover:bg-slate-800/30 transition-colors"
              >
                {columns.map((column) => (
                  <td
                    key={column}
                    className="py-3 px-4 text-slate-300"
                  >
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