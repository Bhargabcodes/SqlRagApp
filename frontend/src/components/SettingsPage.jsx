import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function SettingsPage({ username, setUsername, theme, toggleTheme }) {
  const { user } = useAuth();
  const [tempName, setTempName] = useState(username);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const maskEmail = (email) => {
    if (!email) return "";
    const parts = email.split("@");
    if (parts.length !== 2) return email;
    const [local, domain] = parts;
    if (local.length <= 3) return email;
    return `${local.slice(0, 3)}${"*".repeat(local.length - 3)}@${domain}`;
  };

  const handleSaveUsername = () => {
    if (!tempName.trim()) return;
    setUsername(tempName.trim());
    localStorage.setItem("username", tempName.trim());
    setShowSuccessModal(true);
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="p-5 border border-white/[0.04] bg-white/[0.01] rounded-2xl flex flex-col justify-between min-h-[160px] space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-emerald-400">Profile Settings</h3>
            <div className="flex items-center gap-4 mt-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-lg font-bold">
                {username.substring(0, 2).toUpperCase()}
              </span>
              <div className="flex-1">
                <span className="text-[10px] text-white/30 font-semibold uppercase tracking-wider block mb-1">Username</span>
                <input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Rename username"
                  className="w-full px-3 py-2 text-xs glass-input rounded-xl text-white/80 placeholder:text-white/20"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 text-[11px] pt-1">
            <div className="text-white/30 font-mono">
              Email: {maskEmail(user?.email || "user@sqlrag.com")}<br />
              Status: Verified User
            </div>
            <button
              onClick={handleSaveUsername}
              disabled={!tempName.trim() || tempName === username}
              className="glass-btn glass-btn-primary px-4 py-2 rounded-xl text-[11px] font-semibold text-white cursor-pointer disabled:opacity-30"
            >
              Save
            </button>
          </div>
        </div>

        {/* Theme Preferences Card */}
        <div className="p-5 border border-white/[0.04] bg-white/[0.01] rounded-2xl flex flex-col justify-between min-h-[160px] space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-emerald-400">Theme Preferences</h3>
            <p className="text-xs text-white/40 leading-relaxed font-sans mt-2">
              Customize your dashboard mode. The app adapts to your system settings, but you can manually override it below.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => theme === "dark" && toggleTheme()}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                theme === "light"
                  ? "glass-btn-primary border-teal-500 text-white"
                  : "text-white/60 hover:text-white/80 bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.06] border-white/[0.06]"
              }`}
            >
              Light Mode
            </button>
            <button
              onClick={() => theme === "light" && toggleTheme()}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                theme === "dark"
                  ? "glass-btn-primary border-emerald-500 text-white"
                  : "text-white/60 hover:text-white/80 bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.06] border-white/[0.06]"
              }`}
            >
              Dark Mode
            </button>
          </div>
        </div>

        {/* Database Config Card */}
        <div className="p-5 border border-white/[0.04] bg-white/[0.01] rounded-2xl flex flex-col justify-between min-h-[160px]">
          <div>
            <h3 className="text-sm font-semibold text-emerald-400 mb-3">Database Connection</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/[0.02]">
                <span className="text-white/40">Database Type</span>
                <span className="text-white/80 font-mono font-medium">SQLite</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.02]">
                <span className="text-white/40">File Location</span>
                <span className="text-white/80 font-mono font-medium text-[11px]">/sql/ecommerce.db</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-white/40">API URL</span>
                <span className="text-white/80 font-mono font-medium text-[11px]">http://127.0.0.1:8000</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Glassmorphism Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center z-[100] animate-fade-in">
          <div className="glass-card rounded-2xl p-6 max-w-sm w-full mx-4 space-y-4 animate-scale-in border border-border/40 shadow-2xl bg-card text-foreground">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </span>
              <h3 className="font-bold text-foreground text-base font-serif">Success</h3>
            </div>

            <p className="text-xs text-foreground/75 leading-relaxed font-sans">
              Username updated successfully to <strong className="text-emerald-400">{username}</strong>!
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-600 hover:border-emerald-700 rounded-xl transition-all shadow-md cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
