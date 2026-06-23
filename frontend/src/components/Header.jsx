import { useAuth } from "../context/AuthContext";

function Header() {
  const { user, logout } = useAuth();

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

      <div className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
        {/* User info */}
        {user && (
          <div className="flex items-center gap-2 glass-card rounded-full px-4 py-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/15 border border-purple-500/20">
              <svg className="w-3 h-3 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <span className="text-xs text-white/60">{user.email}</span>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-red-400 bg-white/[0.03] border border-white/[0.06] hover:bg-red-500/10 hover:border-red-500/20 rounded-full px-3 py-1.5 transition-all duration-300"
          title="Sign out"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>

        <span className="flex items-center gap-1.5 text-xs text-white/30 bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
          API Ready
        </span>
      </div>
    </div>
  );
}

export default Header;
