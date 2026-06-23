import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { login, API_BASE } = useAuth();

  // Tabs
  const [tab, setTab] = useState("login"); // "login" | "register"

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  // OTP state
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.detail || "Login failed");
        return;
      }

      login(data.token, data.user);
    } catch (err) {
      setLoginError("Connection error. Make sure the backend is running.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError("");
    setRegLoading(true);

    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail, password: regPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setRegError(data.detail || "Registration failed");
        return;
      }

      setRegSuccess(true);
      setOtpEmail(regEmail);
    } catch (err) {
      setRegError("Connection error. Make sure the backend is running.");
    } finally {
      setRegLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError("");
    setOtpLoading(true);

    try {
      const res = await fetch(`${API_BASE}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setOtpError(data.detail || "Verification failed");
        return;
      }

      login(data.token, data.user);
    } catch (err) {
      setOtpError("Connection error.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError("");

    try {
      const res = await fetch(`${API_BASE}/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail }),
      });
      const data = await res.json();

      if (!res.ok) {
        setOtpError(data.detail || "Failed to resend");
        return;
      }

      alert("OTP resent to your email.");
    } catch {
      setOtpError("Connection error.");
    }
  };

  // ── OTP Verification Screen ──
  if (regSuccess) {
    return (
      <ScreenWrapper>
        <div className="w-full max-w-md mx-auto">
          <LogoSection />
          <div className="glass-card rounded-3xl p-8 animate-fade-in-up">
            <div className="text-center mb-8">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 mx-auto mb-4">
                <svg className="w-7 h-7 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 7l-10 7L2 7" />
                </svg>
              </span>
              <h2 className="text-xl font-semibold text-white/90 mb-1">Verify Your Email</h2>
              <p className="text-sm text-white/40">
                We sent a 6-digit code to{" "}
                <span className="text-purple-300 font-medium">{otpEmail}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-xs text-white/40 mb-2 font-medium uppercase tracking-wider">
                  Verification Code
                </label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full text-center text-2xl tracking-[12px] p-4 glass-input rounded-xl text-white/80 placeholder:text-white/20 font-mono"
                  autoFocus
                />
              </div>

              {otpError && (
                <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/15 rounded-xl px-4 py-3 text-center">
                  {otpError}
                </div>
              )}

              <button
                type="submit"
                disabled={otpLoading || otp.length !== 6}
                className="glass-btn glass-btn-primary w-full py-3.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-30"
              >
                {otpLoading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Verify &amp; Continue
                  </>
                )}
              </button>

              <p className="text-center text-xs text-white/30">
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Resend
                </button>
              </p>
            </form>
          </div>
        </div>
      </ScreenWrapper>
    );
  }

  // ── Main Login/Register Screen ──
  return (
    <ScreenWrapper>
      <div className="w-full max-w-md mx-auto">
        <LogoSection />

        <div className="glass-card rounded-3xl p-8 animate-fade-in-up">
          {/* Tabs */}
          <div className="flex mb-8 p-1 glass-input rounded-xl">
            <button
              onClick={() => { setTab("login"); setRegError(""); setLoginError(""); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                tab === "login"
                  ? "bg-purple-500/20 text-white shadow-lg border border-purple-500/20"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab("register"); setRegError(""); setLoginError(""); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                tab === "register"
                  ? "bg-purple-500/20 text-white shadow-lg border border-purple-500/20"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Login Form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs text-white/40 mb-2 font-medium uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full p-3.5 glass-input rounded-xl text-white/80 placeholder:text-white/20"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-2 font-medium uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full p-3.5 glass-input rounded-xl text-white/80 placeholder:text-white/20"
                />
              </div>

              {loginError && (
                <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/15 rounded-xl px-4 py-3">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading || !loginEmail.trim() || !loginPassword.trim()}
                className="glass-btn glass-btn-primary w-full py-3.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-30"
              >
                {loginLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-xs text-white/40 mb-2 font-medium uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full p-3.5 glass-input rounded-xl text-white/80 placeholder:text-white/20"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-2 font-medium uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full p-3.5 glass-input rounded-xl text-white/80 placeholder:text-white/20"
                />
              </div>

              {regError && (
                <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/15 rounded-xl px-4 py-3">
                  {regError}
                </div>
              )}

              <button
                type="submit"
                disabled={regLoading || !regEmail.trim() || regPassword.length < 6}
                className="glass-btn glass-btn-primary w-full py-3.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-30"
              >
                {regLoading ? "Sending OTP..." : "Create Account & Get OTP"}
              </button>

              <p className="text-center text-xs text-white/30">
                An OTP will be sent to your email for verification.
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-white/20">
          <span>SQLRagApp v2.0</span>
        </div>
      </div>
    </ScreenWrapper>
  );
}

// ── Shared Layout ──

function ScreenWrapper({ children }) {
  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 bg-[#0A0614]">
        <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
        <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
        <div className="fixed top-[50%] right-[-5%] w-[30%] h-[30%] rounded-full bg-blue-600/8 blur-[100px] pointer-events-none" />
        <div className="fixed inset-0 bg-[#0A0614]/60 backdrop-blur-[2px]" />
        <div
          className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        {children}
      </div>
    </div>
  );
}

function LogoSection() {
  return (
    <div className="text-center mb-10 animate-fade-in-up">
      <div className="flex items-center justify-center gap-3 mb-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 shadow-lg shadow-purple-500/5">
          <svg className="w-7 h-7 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </span>
        <div className="text-left">
          <h1 className="text-2xl font-bold text-white/90 tracking-tight">
            AI SQL Converter
          </h1>
          <p className="text-sm text-white/40">
            Ask in English. Get SQL.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
