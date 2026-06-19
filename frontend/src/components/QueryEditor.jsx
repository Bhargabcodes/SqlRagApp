function QueryEditor({ query, setQuery, loading, runQuery }) {
  return (
    <div className="bg-[#111827] border border-slate-700 rounded-xl p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">

        <div>
          <h2 className="text-xl font-semibold text-white">
            SQL Editor
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Write and execute SQL queries
          </p>
        </div>

        <button
          onClick={runQuery}
          disabled={loading}
          className="
            px-5
            py-2.5
            rounded-xl
            bg-blue-600
            hover:bg-blue-700
            disabled:bg-slate-800
            disabled:text-slate-500
            disabled:cursor-not-allowed
            transition-colors
            font-medium
          "
        >
          {loading ? "Running..." : "▶ Run Query"}
        </button>

      </div>

      {/* Editor */}
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        spellCheck="false"
        placeholder="SELECT * FROM products LIMIT 5;"
        className="
          w-full
          h-72
          bg-[#0F172A]
          border
          border-slate-700
          rounded-xl
          p-5
          font-mono
          text-blue-400
          text-sm
          leading-6
          resize-none
          focus:outline-none
          focus:border-blue-500
        "
      />

      {/* Footer */}
      <div className="mt-4 flex justify-between text-sm text-slate-400">

        <span>
          SQLite Database
        </span>

        <span>
          Press Run Query to execute
        </span>

      </div>

    </div>
  );
}

export default QueryEditor;