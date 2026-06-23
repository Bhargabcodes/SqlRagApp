import { useState, useRef, useEffect } from "react";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import QueryEditor from "./components/QueryEditor";
import ResultsPanel from "./components/ResultsPanel";
import QuestionInput from "./components/QuestionInput";
import SchemaManager from "./components/SchemaManager";
import DataManager from "./components/DataManager";
import ColorBends from "./components/ColorBends";
import GradualBlur from "./components/GradualBlur";

function App() {
  const [result, setResult] = useState(null);
  const [query, setQuery] = useState("SELECT * FROM products LIMIT 5;");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState("");
  const [dataSource, setDataSource] = useState("default");
  const [mounted, setMounted] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const generateSQL = async () => {
    if (!question.trim()) return;
    setLoading(true);
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
      setLoading(false);
    }
  };

  const runQuery = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      console.log("EXECUTE RESPONSE:", JSON.stringify(data, null, 2));
      if (data.error) {
        setResult({ error: data.error });
        return;
      }
      setResult({ rows: data.results || [] });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const dataSourceButtons = [
    { key: "default", label: "Default Database" },
    { key: "saved", label: "Saved Schemas" },
    { key: "new", label: "Add New Schema" },
  ];

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <ColorBends
          className="w-full h-full"
          style={{ width: "100vw", height: "100vh" }}
          colors={["#7C3AED", "#6366F1", "#8B5CF6", "#A78BFA"]}
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
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none z-[1]" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none z-[1]" />
      <div className="fixed top-[50%] right-[-5%] w-[30%] h-[30%] rounded-full bg-blue-600/8 blur-[100px] pointer-events-none z-[1]" />

      {/* Dark Glass Overlay */}
      <div className="fixed inset-0 bg-[#0A0614]/60 backdrop-blur-[2px] z-[1]" />

      {/* Subtle grid pattern overlay */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Main Content */}
      <div
        ref={mainRef}
        className={`relative z-10 max-w-7xl mx-auto p-6 transition-all duration-700 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <Header />

        <div className="grid grid-cols-12 gap-6 stagger-children">
          {/* Sidebar */}
          <div className="col-span-2">
            <Sidebar selectedSchema={selectedSchema} />
          </div>

          {/* Main Panel */}
          <div className="col-span-10 space-y-6">
            {/* Choose Data Source */}
            <div className="glass-card rounded-2xl p-5 animate-fade-in-up">
              <h3 className="font-semibold text-sm text-white/60 uppercase tracking-wider mb-4">
                Data Source
              </h3>

              <div className="flex gap-3">
                {dataSourceButtons.map((btn) => (
                  <button
                    key={btn.key}
                    onClick={() => {
                      setDataSource(btn.key);
                      if (btn.key === "default") {
                        setSelectedSchema("products(id,name,category,price)");
                      } else {
                        setSelectedSchema("");
                      }
                    }}
                    className={`relative px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
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

            {/* Default DB */}
            {dataSource === "default" && (
              <div className="glass-card rounded-2xl p-5 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse-glow" />
                    </span>
                    <div>
                      <h3 className="font-medium text-white/90">Active Data Source</h3>
                      <p className="text-sm text-white/40 mt-0.5">Default E-Commerce Database</p>
                    </div>
                  </div>
                  <span className="text-emerald-400 text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                    ● Connected
                  </span>
                </div>
              </div>
            )}

            {/* Saved Schemas */}
            {dataSource === "saved" && (
              <>
                {selectedSchema && (
                  <div className="glass-card rounded-2xl p-5 animate-fade-in-up">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20">
                          <span className="h-2.5 w-2.5 rounded-full bg-purple-400 animate-pulse-glow" />
                        </span>
                        <div>
                          <h3 className="font-medium text-white/90">Active Data Source</h3>
                          <p className="text-sm text-white/40 mt-0.5">Saved Schema Selected</p>
                        </div>
                      </div>
                      <span className="text-purple-400 text-xs font-medium bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
                        ● Selected
                      </span>
                    </div>
                  </div>
                )}
                <SchemaManager
                  selectedSchema={selectedSchema}
                  setSelectedSchema={setSelectedSchema}
                />
              </>
            )}

            {/* New Schema */}
            {dataSource === "new" && (
              <SchemaManager
                selectedSchema={selectedSchema}
                setSelectedSchema={setSelectedSchema}
              />
            )}

            {/* Data Manager */}
            {selectedSchema && dataSource !== "default" && (
              <DataManager selectedSchema={selectedSchema} />
            )}

            {/* Question Input */}
            <QuestionInput
              question={question}
              setQuestion={setQuestion}
              loading={loading}
              generateSQL={generateSQL}
            />

            {/* Query Editor */}
            <QueryEditor
              query={query}
              setQuery={setQuery}
              loading={loading}
              runQuery={runQuery}
            />

            {/* Results */}
            <ResultsPanel result={result} loading={loading} />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 text-center">
          <div className="inline-flex items-center gap-4 glass-card rounded-full px-6 py-3 text-xs text-white/30">
            <span className="text-white/40">FastAPI</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-white/40">React</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-white/40">SQLite</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-white/40">Groq</span>
          </div>
        </div>

        {/* Bottom Blur */}
        <GradualBlur
          target="parent"
          position="bottom"
          height="8rem"
          strength={3}
          divCount={6}
          curve="bezier"
          exponential
          opacity={1}
        />
      </div>
    </div>
  );
}

export default App;
