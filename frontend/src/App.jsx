import { useState, useRef, useEffect } from "react";
import { useAuth } from "./context/AuthContext";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import QueryEditor from "./components/QueryEditor";
import ResultsPanel from "./components/ResultsPanel";
import QuestionInput from "./components/QuestionInput";
import SchemaManager from "./components/SchemaManager";
import DataManager from "./components/DataManager";
import ColorBends from "./components/ColorBends";
import GradualBlur from "./components/GradualBlur";
import LoginPage from "./components/LoginPage";
import LoadingSpinner from "./components/LoadingSpinner";
import DashboardHome from "./components/DashboardHome";
import HistoryLog from "./components/HistoryLog";
import SettingsPage from "./components/SettingsPage";

function App() {
  const { user, loading, authFetch, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [theme, setTheme] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      setTheme(e.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const [result, setResult] = useState(null);
  const [query, setQuery] = useState("SELECT id, name, category, price\nFROM products\nWHERE stock > 0\nORDER BY price DESC\nLIMIT 5;");
  const [question, setQuestion] = useState("");
  const [appLoading, setAppLoading] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState(
    "products(id,name,price,category,stock) orders(id,customer_id,total) customers(id,name,email)"
  );
  const [dataSource, setDataSource] = useState("default");
  const [schemas, setSchemas] = useState([]);
  const [mounted, setMounted] = useState(false);
  const mainRef = useRef(null);

  // Tab navigation states
  const [activeTab, setActiveTab] = useState("home");
  const [recentQueries, setRecentQueries] = useState(() => {
    const saved = localStorage.getItem("query_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((q) => {
          let updated = { ...q };
          if (!updated.duration) {
            if (updated.question === "Show all users who placed orders in the last 30 days") {
              updated.duration = "1.10s";
            } else if (updated.question === "What are the top 5 products by total sales?") {
              updated.duration = "0.85s";
            } else if (updated.question === "Show monthly revenue for the current year") {
              updated.duration = "1.92s";
            }
          }
          if (!updated.timestamp) {
            if (updated.question === "Show all users who placed orders in the last 30 days") {
              updated.timestamp = Date.now() - 2 * 60 * 1000;
            } else if (updated.question === "What are the top 5 products by total sales?") {
              updated.timestamp = Date.now() - 10 * 60 * 1000;
            } else if (updated.question === "Show monthly revenue for the current year") {
              updated.timestamp = Date.now() - 60 * 60 * 1000;
            } else {
              updated.timestamp = Date.now() - 24 * 60 * 60 * 1000;
            }
          }
          return updated;
        });
      } catch (err) {
        console.error("Failed to parse query history", err);
      }
    }
    const defaultMockHistory = [
      {
        question: "Show all users who placed orders in the last 30 days",
        sql: "SELECT u.* FROM users u JOIN orders o ON u.id = o.user_id WHERE o.order_date >= date('now', '-30 days');",
        time: "2m ago",
        duration: "1.10s",
        status: "Success",
        timestamp: Date.now() - 2 * 60 * 1000,
      },
      {
        question: "What are the top 5 products by total sales?",
        sql: "SELECT p.name, SUM(oi.quantity * oi.price) as total_sales FROM products p JOIN order_items oi ON p.id = oi.product_id GROUP BY p.id ORDER BY total_sales DESC LIMIT 5;",
        time: "10m ago",
        duration: "0.85s",
        status: "Success",
        timestamp: Date.now() - 10 * 60 * 1000,
      },
      {
        question: "Show monthly revenue for the current year",
        sql: "SELECT strftime('%Y-%m', o.order_date) as month, SUM(o.total) FROM orders o WHERE o.order_date >= date('now', 'start of year') GROUP BY month;",
        time: "1h ago",
        duration: "1.92s",
        status: "Success",
        timestamp: Date.now() - 60 * 60 * 1000,
      },
      {
        question: "Show total sales for each customer",
        sql: "SELECT c.name, SUM(o.total) FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.id;",
        time: "10d ago",
        duration: "1.50s",
        status: "Success",
        timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000,
      },
      {
        question: "Count number of products in stock",
        sql: "SELECT COUNT(*) FROM products WHERE stock > 0;",
        time: "11d ago",
        duration: "2.10s",
        status: "Failed",
        timestamp: Date.now() - 11 * 24 * 60 * 60 * 1000,
      }
    ];
    localStorage.setItem("query_history", JSON.stringify(defaultMockHistory));
    return defaultMockHistory;
  });
  const [tablesFolderExpanded, setTablesFolderExpanded] = useState(true);
  const [expandedTables, setExpandedTables] = useState({ products: true });
  const [showSchemaExplorer, setShowSchemaExplorer] = useState(true);

  const [username, setUsername] = useState(() => {
    const saved = localStorage.getItem("username");
    return saved || "User";
  });

  useEffect(() => {
    if (user && !localStorage.getItem("username")) {
      const prefix = user.email.split("@")[0];
      setUsername(prefix.charAt(0).toUpperCase() + prefix.slice(1));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("query_history", JSON.stringify(recentQueries));
  }, [recentQueries]);

  const deleteQueryHistoryItem = (indexToDelete) => {
    setRecentQueries((prev) => prev.filter((_, idx) => idx !== indexToDelete));
  };

  const fetchSchemas = async () => {
    if (!authFetch) return;
    try {
      const response = await authFetch("/schemas");
      const data = await response.json();
      setSchemas(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSchemas();
    }
  }, [user]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="relative min-h-screen text-white overflow-hidden bg-[#0A0614] flex items-center justify-center">
        <LoadingSpinner size="lg" label="Checking session..." />
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <LoginPage />;
  }

  const generateSQL = async () => {
    if (!question.trim()) return;
    setAppLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, schema: selectedSchema }),
      });
      const data = await response.json();
      console.log(data);
      setQuery(data.sql);
    } catch (err) {
      console.log(err);
    } finally {
      setAppLoading(false);
    }
  };

  const runQuery = async () => {
    setAppLoading(true);
    const start = performance.now();
    try {
      const response = await fetch("http://127.0.0.1:8000/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      const durationSec = ((performance.now() - start) / 1000).toFixed(2);
      console.log("EXECUTE RESPONSE:", JSON.stringify(data, null, 2));
      if (data.error) {
        setResult({ error: data.error });
        setRecentQueries((prev) => [
          {
            question: question || "Direct SQL editor query",
            sql: query,
            time: "Just now",
            duration: `${durationSec}s`,
            status: "Failed",
            error: data.error,
            timestamp: Date.now(),
          },
          ...prev,
        ]);
        return;
      }
      setResult({ rows: data.results || [] });
      setRecentQueries((prev) => [
        {
          question: question || "Direct SQL editor query",
          sql: query,
          time: "Just now",
          duration: `${durationSec}s`,
          status: "Success",
          timestamp: Date.now(),
        },
        ...prev,
      ]);
    } catch (err) {
      console.log(err);
    } finally {
      setAppLoading(false);
    }
  };

  const dataSourceButtons = [
    { key: "default", label: "Default Database" },
    { key: "saved", label: "Saved Schemas" },
    { key: "new", label: "Add New Schema" },
  ];

  const parseSchema = (schemaStr) => {
    if (!schemaStr) return [];
    const tables = [];
    const tableRegex = /(\w+)\s*\(([^)]+)\)/g;
    let match;
    while ((match = tableRegex.exec(schemaStr)) !== null) {
      const tableName = match[1];
      const columnsStr = match[2];
      const columns = columnsStr.split(",").map((col) => {
        const parts = col.trim().split(/\s+/);
        return { name: parts[0], type: parts[1] || "TEXT" };
      });
      tables.push({ name: tableName, columns });
    }
    return tables;
  };

  return (
    <div className="relative min-h-screen text-white overflow-hidden flex">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <ColorBends
          className="w-full h-full"
          style={{ width: "100vw", height: "100vh" }}
          colors={
            theme === "dark"
              ? ["#0D2823", "#173D35", "#4E8F82", "#88C7AE"]
              : ["#F4F1E8", "#E8E2D0", "#B6D7D4", "#7AB9B0"]
          }
          rotation={90}
          speed={0.15}
          scale={1}
          frequency={0.8}
          warpStrength={0.8}
          mouseInfluence={0.6}
          noise={0.1}
          parallax={0.3}
          iterations={2}
          intensity={1.2}
          bandWidth={5}
          transparent={true}
          autoRotate={0.03}
        />
      </div>

      {/* Gradient Orbs */}
      <div className={`fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] pointer-events-none z-[1] transition-all duration-1000 ${
        theme === "dark" ? "bg-emerald-800/10" : "bg-teal-600/5"
      }`} />
      <div className={`fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none z-[1] transition-all duration-1000 ${
        theme === "dark" ? "bg-teal-700/10" : "bg-emerald-600/5"
      }`} />
      <div className={`fixed top-[50%] right-[-5%] w-[30%] h-[30%] rounded-full blur-[100px] pointer-events-none z-[1] transition-all duration-1000 ${
        theme === "dark" ? "bg-emerald-900/10" : "bg-teal-500/5"
      }`} />

      {/* Dark Glass Overlay */}
      <div className={`fixed inset-0 backdrop-blur-[2px] z-[1] transition-colors duration-1000 ${
        theme === "dark" ? "bg-[#081B18]/70" : "bg-[#F8F6F0]/50"
      }`} />

      {/* Subtle grid pattern overlay */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Sidebar Component on the left */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        username={username}
        onLogout={() => setShowLogoutConfirm(true)}
      />

      {/* Main Workspace Scrollable Area */}
      <div
        ref={mainRef}
        className={`flex-1 h-screen overflow-y-auto p-6 relative z-10 flex flex-col justify-between transition-all duration-700 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="w-full space-y-5">
          {/* Aligned Page Header Row */}
          <div className="flex justify-between items-start mb-2">
            <div>
              {activeTab === "home" && (
                <div>
                  <h1 className="text-2xl font-bold text-white/95 font-serif tracking-tight leading-none">Dashboard</h1>
                  <p className="text-xs text-white/40 mt-2 font-medium">Welcome back, {username}! 👋</p>
                </div>
              )}
              {activeTab === "query" && (
                <div>
                  <h1 className="text-2xl font-bold text-white/95 font-serif tracking-tight leading-none">Query Editor</h1>
                  <p className="text-xs text-white/40 mt-2 font-medium">Write and run custom SQL queries</p>
                </div>
              )}
              {activeTab === "schema" && (
                <div>
                  <h1 className="text-2xl font-bold text-white/95 font-serif tracking-tight leading-none">Schema Manager</h1>
                  <p className="text-xs text-white/40 mt-2 font-medium">Create and edit database connection schemas</p>
                </div>
              )}
              {activeTab === "tables" && (
                <div>
                  <h1 className="text-2xl font-bold text-white/95 font-serif tracking-tight leading-none">Tables</h1>
                  <p className="text-xs text-white/40 mt-2 font-medium">Explore active tables and manage data rows</p>
                </div>
              )}
              {activeTab === "history" && (
                <div>
                  <h1 className="text-2xl font-bold text-white/95 font-serif tracking-tight leading-none">Query History</h1>
                  <p className="text-xs text-white/40 mt-2 font-medium">Review logs of executed queries</p>
                </div>
              )}
              {activeTab === "settings" && (
                <div>
                  <h1 className="text-2xl font-bold text-white/95 font-serif tracking-tight leading-none">Settings</h1>
                  <p className="text-xs text-white/40 mt-2 font-medium">Manage app configuration and profiles</p>
                </div>
              )}
            </div>
            <Header theme={theme} toggleTheme={toggleTheme} setActiveTab={setActiveTab} onLogout={() => setShowLogoutConfirm(true)} />
          </div>

          {activeTab === "home" && (
            <DashboardHome
              user={user}
              question={question}
              setQuestion={setQuestion}
              loading={appLoading}
              generateSQL={generateSQL}
              selectedSchema={selectedSchema}
              recentQueries={recentQueries}
              setExpandedTables={setExpandedTables}
              setTablesFolderExpanded={setTablesFolderExpanded}
              setActiveTab={setActiveTab}
              username={username}
            />
          )}

          {activeTab === "query" && (
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {showSchemaExplorer && (
                <div className="w-64 shrink-0 glass-card rounded-2xl p-5 space-y-4 max-h-[700px] overflow-y-auto">
                  <div className="flex justify-between items-center pb-2 border-b border-white/[0.04]">
                    <span className="text-xs font-semibold text-emerald-400">Schema Explorer</span>
                    <button
                      onClick={() => setShowSchemaExplorer(false)}
                      className="text-[10px] text-white/30 hover:text-white cursor-pointer"
                    >
                      Hide
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-white/70 font-semibold">
                      <svg className="w-3.5 h-3.5 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <ellipse cx="12" cy="5" rx="9" ry="3" />
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                      </svg>
                      <span>Default database</span>
                    </div>

                    <div className="pl-3 border-l border-white/[0.04] ml-2 space-y-2">
                      {parseSchema(selectedSchema).map((table) => {
                        const isExpanded = !!expandedTables[table.name];
                        return (
                          <div key={table.name} className="space-y-1">
                            <div
                              onClick={() =>
                                setExpandedTables((prev) => ({
                                  ...prev,
                                  [table.name]: !prev[table.name],
                                }))
                              }
                              className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white cursor-pointer"
                            >
                              <svg className="w-3 h-3 text-emerald-500/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <line x1="3" y1="9" x2="21" y2="9" />
                                <line x1="9" y1="21" x2="9" y2="9" />
                              </svg>
                              <span className="font-semibold">{table.name}</span>
                            </div>
                            {isExpanded && (
                              <div className="pl-4 space-y-1 ml-1.5 border-l border-white/[0.03]">
                                {table.columns.map((col) => (
                                  <div key={col.name} className="flex justify-between items-center text-[10px] text-white/40 py-0.5">
                                    <span>{col.name}</span>
                                    <span className="text-[9px] font-mono px-1 py-0.25 bg-white/[0.02] border border-white/[0.04] rounded-md text-white/20">
                                      {col.type}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-1 space-y-6 w-full">
                <div className="flex justify-between items-center">
                  {!showSchemaExplorer && (
                    <button
                      onClick={() => setShowSchemaExplorer(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white/50 hover:text-white bg-white/[0.02] border border-white/[0.06] rounded-xl transition-all duration-200 cursor-pointer"
                    >
                      Show Schema Explorer
                    </button>
                  )}
                </div>

                {/* Choose Data Source Card */}
                <div className="glass-card rounded-2xl p-5 animate-fade-in-up">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <line x1="3" y1="9" x2="21" y2="9" />
                          <line x1="9" y1="21" x2="9" y2="9" />
                        </svg>
                      </span>
                      <div>
                        <h3 className="font-medium text-white/90">Data source</h3>
                        <p className="text-xs text-white/40 mt-0.5">Active connection</p>
                      </div>
                    </div>
                    <span className="text-emerald-400 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse-glow">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Connected
                    </span>
                  </div>

                  <div className="flex gap-3 mt-5">
                    {dataSourceButtons.map((btn) => (
                      <button
                        key={btn.key}
                        onClick={() => {
                          setDataSource(btn.key);
                          if (btn.key === "default") {
                            setSelectedSchema(
                              "products(id,name,price,category,stock) orders(id,customer_id,total) customers(id,name,email)"
                            );
                          } else {
                            setSelectedSchema("");
                          }
                        }}
                        className={`relative px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                          dataSource === btn.key
                            ? "glass-btn-primary text-white shadow-lg"
                            : "text-white/50 hover:text-white/80 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12]"
                        }`}
                      >
                        {dataSource === btn.key && (
                          <span className="absolute inset-0 rounded-xl animate-glow-pulse" />
                        )}
                        <span className="relative z-[1]">{btn.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Data Source Summary Detail Card */}
                {dataSource === "default" && (
                  <div className="glass-card rounded-2xl p-5 animate-fade-in-up">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-glow" />
                      <div>
                        <h3 className="font-semibold text-sm text-white/90">Default E-Commerce Database</h3>
                        <p className="text-xs text-white/40 mt-0.5">SQLite · 3 tables · last synced just now</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Saved Schemas Panel */}
                {dataSource === "saved" && (
                  <>
                    {selectedSchema && (
                      <div className="glass-card rounded-2xl p-5 animate-fade-in-up">
                        <div className="flex items-center gap-3">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-glow" />
                          <div>
                            <h3 className="font-semibold text-sm text-white/90">Saved Schema Connection</h3>
                            <p className="text-xs text-white/40 mt-0.5">Active custom connection schema</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <SchemaManager
                      selectedSchema={selectedSchema}
                      setSelectedSchema={setSelectedSchema}
                      schemas={schemas}
                      fetchSchemas={fetchSchemas}
                    />
                  </>
                )}

                {/* New Schema Panel */}
                {dataSource === "new" && (
                  <SchemaManager
                    selectedSchema={selectedSchema}
                    setSelectedSchema={setSelectedSchema}
                    schemas={schemas}
                    fetchSchemas={fetchSchemas}
                  />
                )}

                {/* Data Manager (if schema selected) */}
                {selectedSchema && dataSource !== "default" && (
                  <DataManager selectedSchema={selectedSchema} />
                )}

                {/* Query Editor */}
                <QueryEditor
                  query={query}
                  setQuery={setQuery}
                  loading={appLoading}
                  runQuery={runQuery}
                />

                {/* Results Panel */}
                <ResultsPanel result={result} loading={appLoading} />
              </div>
            </div>
          )}

          {activeTab === "schema" && (
            <SchemaManager
              selectedSchema={selectedSchema}
              setSelectedSchema={setSelectedSchema}
              schemas={schemas}
              fetchSchemas={fetchSchemas}
            />
          )}

          {activeTab === "tables" && (
            <DataManager selectedSchema={selectedSchema} />
          )}

          {activeTab === "history" && (
            <HistoryLog
              recentQueries={recentQueries}
              clearHistory={() => setRecentQueries([])}
              deleteHistoryItem={deleteQueryHistoryItem}
            />
          )}

          {activeTab === "settings" && (
            <SettingsPage
              username={username}
              setUsername={setUsername}
              theme={theme}
              toggleTheme={toggleTheme}
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 text-center w-full mx-auto">
          <div className="inline-flex items-center gap-4 glass-card rounded-full px-6 py-3 text-xs text-white/30">
            <span className="text-white/40 font-semibold">FastAPI</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-white/40 font-semibold">React</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-white/40 font-semibold">SQLite</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-white/40 font-semibold">Groq</span>
          </div>
        </div>

      </div>

      {/* Custom Glassmorphism Confirmation Modal for Logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center z-[100] animate-fade-in">
          <div className="glass-card rounded-2xl p-6 max-w-sm w-full mx-4 space-y-4 animate-scale-in border border-border/40 shadow-2xl bg-card text-foreground">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/25 text-red-500">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </span>
              <h3 className="font-bold text-foreground text-base font-serif">Confirm Logout</h3>
            </div>

            <p className="text-xs text-foreground/75 leading-relaxed font-sans">
              Are you sure you want to log out of your account?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-foreground/60 hover:text-foreground bg-foreground/[0.02] hover:bg-foreground/[0.06] border border-border/60 rounded-xl transition-all cursor-pointer"
              >
                No
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="px-5 py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 border border-red-500 hover:border-red-600 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
