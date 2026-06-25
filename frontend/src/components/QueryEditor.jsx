import LoadingSpinner from "./LoadingSpinner";

function QueryEditor({ query, setQuery, loading, runQuery }) {
  const linesCount = Math.max(query.split("\n").length, 6);
  const lineNumbers = Array.from({ length: linesCount }, (_, i) => i + 1);

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    alert("Query copied to clipboard!");
  };

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </span>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              SQL editor
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Write and run queries directly
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center justify-center p-2.5 rounded-xl border border-border/40 hover:bg-foreground/5 text-foreground/50 hover:text-foreground transition-all duration-300 cursor-pointer"
            title="Copy Query"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          </button>

          {/* Run Query Button */}
          <button
            onClick={runQuery}
            disabled={loading}
            className="glass-btn glass-btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>Run query</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor with Line Numbers */}
      <div className="flex bg-[#0A0614]/60 border border-border/40 rounded-2xl overflow-hidden font-mono text-sm leading-6">
        {/* Line Numbers Column */}
        <div className="select-none text-right pr-3 pl-4 py-4 text-muted-foreground/30 border-r border-border/20 bg-foreground/1 bg-opacity-20 text-xs">
          {lineNumbers.map((n) => (
            <div key={n}>{n}</div>
          ))}
        </div>

        {/* Textarea Column */}
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          spellCheck="false"
          placeholder="SELECT * FROM products LIMIT 5;"
          className="
            flex-1
            p-4
            bg-transparent
            text-primary
            focus:outline-none
            resize-none
            h-64
            border-none
            text-xs
            leading-6
          "
        />
      </div>

      {/* Footer */}
      <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground/60">
        <span className="flex items-center gap-1.5 font-medium">
          <svg className="w-3.5 h-3.5 text-muted-foreground/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </svg>
          SQLite · Default E-Commerce
        </span>
        <span>
          Press <kbd className="px-1.5 py-0.5 rounded bg-foreground/5 border border-border/40 text-[10px] font-mono font-bold">Run query</kbd> to execute
        </span>
      </div>
    </div>
  );
}

export default QueryEditor;
