import LoadingSpinner from "./LoadingSpinner";

function QueryEditor({ query, setQuery, loading, runQuery }) {
  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white/90">
              SQL Editor
            </h2>
            <p className="text-xs text-white/40 mt-0.5">
              Write and execute SQL queries
            </p>
          </div>
        </div>

        <button
          onClick={runQuery}
          disabled={loading}
          className="glass-btn glass-btn-primary px-5 py-2.5 rounded-xl text-sm font-medium text-white flex items-center gap-2"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Run Query</span>
            </>
          )}
        </button>
      </div>

      {/* Editor */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-10 bg-white/[0.01] rounded-t-2xl border-b border-white/[0.04] flex items-center gap-1.5 px-4 z-[1]">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/50" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/50" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/50" />
          <span className="ml-3 text-[10px] text-white/20 uppercase tracking-wider">query.sql</span>
        </div>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          spellCheck="false"
          placeholder="SELECT * FROM products LIMIT 5;"
          className="
            w-full
            h-72
            pt-12
            p-5
            bg-[#0A0614]/60
            border
            border-white/[0.06]
            rounded-2xl
            font-mono
            text-purple-300
            text-sm
            leading-6
            resize-none
            focus:outline-none
            focus:border-purple-500/30
            focus:bg-[#0A0614]/80
            transition-all
            duration-300
            placeholder:text-white/15
          "
        />
      </div>

      {/* Footer */}
      <div className="mt-4 flex justify-between items-center text-xs text-white/30">
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </svg>
          SQLite Database
        </span>
        <span className="text-white/20">
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[10px] font-mono">Run Query</kbd> to execute
        </span>
      </div>
    </div>
  );
}

export default QueryEditor;
