function Header() {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3 mb-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 shadow-lg shadow-purple-500/5">
            <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </span>
          <div>
            <h1 className="text-2xl font-bold text-white/90 tracking-tight">
              AI SQL Converter
            </h1>
            <p className="text-sm text-white/40">
              Ask in English. Get SQL.
            </p>
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
        <span className="flex items-center gap-1.5 text-xs text-white/30 bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
          API Ready
        </span>
      </div>
    </div>
  );
}

export default Header;