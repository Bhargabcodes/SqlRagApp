import { useEffect, useState } from "react";

function SchemaManager({ selectedSchema, setSelectedSchema }) {
  const [schemaName, setSchemaName] = useState("");
  const [schemaContent, setSchemaContent] = useState("");
  const [schemas, setSchemas] = useState([]);
  const [activeSchema, setActiveSchema] = useState(null);

  const fetchSchemas = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/schemas");
      const data = await response.json();
      setSchemas(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchSchemas();
  }, []);

  const saveSchema = async () => {
    if (!schemaName.trim() || !schemaContent.trim()) {
      alert("Please fill out both the schema name and the content configuration.");
      return;
    }
    try {
      await fetch("http://127.0.0.1:8000/save-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schema_name: schemaName, schema_content: schemaContent }),
      });
      alert("Schema Saved");
      setSchemaName("");
      setSchemaContent("");
      fetchSchemas();
    } catch (err) {
      console.log(err);
    }
  };

  const deleteSchema = async (schemaId) => {
    try {
      await fetch(`http://127.0.0.1:8000/schema/${schemaId}`, { method: "DELETE" });
      setSelectedSchema("");
      fetchSchemas();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
          <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </span>
        <div>
          <h2 className="text-lg font-semibold text-white/90">Schema Manager</h2>
          <p className="text-xs text-white/40 mt-0.5">Manage database schemas</p>
        </div>
      </div>

      <div className="space-y-3">
        <input
          value={schemaName}
          onChange={(e) => setSchemaName(e.target.value)}
          placeholder="Schema Name"
          className="w-full p-3 glass-input rounded-xl text-white/80 placeholder:text-white/20"
        />

        <textarea
          value={schemaContent}
          onChange={(e) => setSchemaContent(e.target.value)}
          placeholder="products(id,name,price)"
          className="w-full h-32 p-3 glass-input rounded-xl text-white/80 placeholder:text-white/20 resize-none"
        />

        <div className="flex justify-end">
          <button
            onClick={saveSchema}
            disabled={!schemaName.trim() || !schemaContent.trim()}
            className="glass-btn glass-btn-primary px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save Schema
            </span>
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
          Saved Schemas
        </h3>

        <div className="space-y-3">
          {schemas.map((schema, index) => (
            <div
              key={schema.id}
              onClick={() => {
                setSelectedSchema(schema.schema_content);
                setActiveSchema(schema);
              }}
              className={`
                group cursor-pointer rounded-2xl p-4 border transition-all duration-300
                ${
                  selectedSchema === schema.schema_content
                    ? "border-purple-500/30 bg-purple-500/5 shadow-lg shadow-purple-500/5"
                    : "border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.12]"
                }
              `}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <svg className="w-5 h-5 text-purple-400/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                  </svg>
                  <span className="font-medium text-purple-300">{schema.schema_name}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Are you sure you want to delete this schema? All associated tables will be removed.")) {
                      deleteSchema(schema.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
                  title="Delete Schema"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </div>

              <div className="text-xs text-white/30 mt-3 font-mono bg-[#0A0614]/40 p-2.5 rounded-xl border border-white/[0.04] overflow-x-auto whitespace-pre-wrap">
                {schema.schema_content}
              </div>
            </div>
          ))}

          {schemas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-white/[0.06] rounded-2xl">
              <div className="text-2xl mb-2 opacity-20">📂</div>
              <div className="text-sm text-white/30">No custom schemas defined yet.</div>
            </div>
          )}

          {activeSchema && (
            <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 animate-fade-in-up">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
                Schema Details
              </h3>
              <div className="text-white/60 text-sm font-mono bg-[#0A0614]/40 p-3 rounded-xl border border-white/[0.04] whitespace-pre-wrap">
                {activeSchema.schema_content}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SchemaManager;
