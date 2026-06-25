import { useAuth } from "../context/AuthContext";
import { useState } from "react";

function Header({ setActiveTab, theme, toggleTheme, onLogout }) {
  const { user } = useAuth();

  const maskEmail = (email) => {
    if (!email) return "";
    const parts = email.split("@");
    if (parts.length !== 2) return email;
    const [local, domain] = parts;
    if (local.length <= 3) return email;
    return `${local.slice(0, 3)}${"*".repeat(local.length - 3)}@${domain}`;
  };

  return (
    <div className="flex items-center justify-end gap-3 mb-6 animate-fade-in-up">
      {/* API Ready Status */}
      <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/5 border border-emerald-500/25 rounded-full px-3.5 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
        API ready
      </span>

      {/* User email badge */}
      {user && (
        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-full px-4 py-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white/60">
            <svg
              className="w-3.5 h-3.5 text-white/50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <span className="text-xs text-white/60 font-mono">{maskEmail(user.email)}</span>
        </div>
      )}

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center p-2 text-white/30 hover:text-white bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] rounded-full w-8 h-8 transition-all duration-300 cursor-pointer"
        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {theme === "dark" ? (
          <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      {/* Settings gear */}
      <button
        onClick={() => setActiveTab && setActiveTab("settings")}
        className="flex items-center justify-center p-2 text-white/30 hover:text-white bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] rounded-full w-8 h-8 transition-all duration-300 cursor-pointer"
        title="Settings"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      </button>

      {/* Logout button */}
      <button
        onClick={onLogout}
        className="flex items-center justify-center p-2 text-white/30 hover:text-red-400 bg-white/[0.03] border border-white/[0.06] hover:bg-red-500/10 hover:border-red-500/20 rounded-full w-8 h-8 transition-all duration-300 cursor-pointer"
        title="Sign out"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  );
}

export default Header;
