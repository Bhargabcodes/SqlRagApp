import { useState } from "react";

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

  const [query, setQuery] = useState(
    "SELECT * FROM products LIMIT 5;"
  );

  const [question, setQuestion] = useState("");

  const [loading, setLoading] = useState(false);

  const [selectedSchema, setSelectedSchema] = useState("");
  const [dataSource, setDataSource] = useState("default");

  const generateSQL = async () => {
    if (!question.trim()) return;

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question,
            schema: selectedSchema,
          }),
        }
      );

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
      const response = await fetch(
        "http://127.0.0.1:8000/execute",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        }
      );

      const data = await response.json();

      console.log(
        "EXECUTE RESPONSE:",
        JSON.stringify(data, null, 2)
      );

      if (data.error) {
        setResult({
          error: data.error,
        });
        return;
      }

      setResult({
        rows: data.results || [],
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <ColorBends
          className="w-full h-full"
          style={{
            width: "100vw",
            height: "100vh",
          }}
          colors={["#A855F7"]}
          rotation={90}
          speed={0.2}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          noise={0.15}
          parallax={0.5}
          iterations={1}
          intensity={1.5}
          bandWidth={6}
          transparent={false}
          autoRotate={0}
        />
      </div>

      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-[#0F172A]/75 z-[1]" />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        <Header />

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-2">
            <Sidebar selectedSchema={selectedSchema} />
          </div>

          {/* Main Panel */}
          <div className="col-span-10 space-y-6">
            {/* Choose Data Source */}
            <div className="bg-[#111827] border border-slate-700 rounded-xl p-4 text-white">
              <h3 className="font-semibold mb-3">
                Choose Data Source
              </h3>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDataSource("default");
                    setSelectedSchema(
                      "products(id,name,category,price)"
                    );
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
                    dataSource === "default"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                  }`}
                >
                  Default Database
                </button>

                <button
                  onClick={() => {
                    setDataSource("saved");
                    setSelectedSchema("");
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
                    dataSource === "saved"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                  }`}
                >
                  Saved Schemas
                </button>

                <button
                  onClick={() => {
                    setDataSource("new");
                    setSelectedSchema("");
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
                    dataSource === "new"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                  }`}
                >
                  Add New Schema
                </button>
              </div>
            </div>

            {/* Default DB */}
            {dataSource === "default" && (
              <div className="bg-[#111827] border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">
                      Active Data Source
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Default E-Commerce Database
                    </p>
                  </div>

                  <span className="text-green-400 text-sm">
                    ✓ Connected
                  </span>
                </div>
              </div>
            )}

            {/* Saved Schemas */}
            {dataSource === "saved" && (
              <>
                {selectedSchema && (
                  <div className="bg-[#111827] border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">
                          Active Data Source
                        </h3>

                        <p className="text-sm text-slate-400 mt-1">
                          Saved Schema Selected
                        </p>
                      </div>

                      <span className="text-green-400 text-sm">
                        ✓ Selected
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
            {selectedSchema &&
              dataSource !== "default" && (
                <DataManager
                  selectedSchema={selectedSchema}
                />
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
            <ResultsPanel result={result} />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 border-t border-slate-800 pt-4 text-sm text-slate-500">
          FastAPI • React • SQLite • Groq
        </div>

        {/* Bottom Blur */}
        <GradualBlur
          target="parent"
          position="bottom"
          height="7rem"
          strength={2}
          divCount={5}
          curve="bezier"
          exponential
          opacity={1}
        />
      </div>
    </div>
  );
}

export default App;