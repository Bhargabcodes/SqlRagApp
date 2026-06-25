import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function SchemaManager({ selectedSchema, setSelectedSchema, schemas, fetchSchemas }) {
  const { authFetch } = useAuth();
  const [schemaName, setSchemaName] = useState("");
  const [schemaContent, setSchemaContent] = useState("");
  const [activeSchema, setActiveSchema] = useState(null);

  // Custom modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [schemaIdToDelete, setSchemaIdToDelete] = useState(null);
  const [schemaNameToDelete, setSchemaNameToDelete] = useState("");

  const saveSchema = async () => {
    if (!schemaName.trim() || !schemaContent.trim()) {
      alert("Please fill out both the schema name and the content configuration.");
      return;
    }
    try {
      await authFetch("/save-schema", {
        method: "POST",
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
      await authFetch(`/schema/${schemaId}`, { method: "DELETE" });
      setSelectedSchema("");
      fetchSchemas();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteClick = (schema, e) => {
    e.stopPropagation();
    setSchemaIdToDelete(schema.id);
    setSchemaNameToDelete(schema.schema_name);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (schemaIdToDelete) {
      deleteSchema(schemaIdToDelete);
    }
    setShowDeleteConfirm(false);
    setSchemaIdToDelete(null);
    setSchemaNameToDelete("");
    setActiveSchema(null);
  };

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in-up relative">
      <div className="flex items-center gap-3 mb-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
          <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
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
        {/* Format instruction box */}
        <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] text-xs space-y-3">
          <p className="text-white/60 font-medium">
            Tables must be in the following format:
          </p>

          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <div className="text-white/70 leading-relaxed">
              <span className="text-emerald-400 font-semibold">✓ Correct:</span>{' '}
              <code className="text-[11px] leading-relaxed">
                Students(student_id INTEGER PRIMARY KEY, name TEXT, age INTEGER, department TEXT, cgpa REAL)<br />
                Courses(course_id INTEGER PRIMARY KEY, course_name TEXT, credits INTEGER)<br />
                Enrollments(enrollment_id INTEGER PRIMARY KEY, student_id INTEGER, course_id INTEGER, semester TEXT)
              </code>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
              <svg className="w-3 h-3 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </span>
            <div className="text-white/70 leading-relaxed">
              <span className="text-red-400 font-semibold">✗ Incorrect:</span>{' '}
              <code className="text-[11px]">
                CREATE TABLE Students (student_id INT, name VARCHAR(100), ...);
              </code>
            </div>
          </div>
        </div>

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
            className="glass-btn glass-btn-primary px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4 font-serif">
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
                group cursor-pointer rounded-2xl p-4 transition-all duration-300
                ${
                  selectedSchema === schema.schema_content
                    ? "schema-card-selected shadow-lg"
                    : "schema-card-unselected"
                }
              `}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <svg className="w-5 h-5 text-purple-400/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                  </svg>
                  <span className="font-medium text-white/90">{schema.schema_name}</span>
                </div>

                <button
                  onClick={(e) => handleDeleteClick(schema, e)}
                  className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
                  title="Delete Schema"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>

              <div className="text-xs text-white/80 mt-3 font-mono bg-[#0A0614]/40 p-2.5 rounded-xl border border-white/[0.04] overflow-x-auto whitespace-pre-wrap">
                {schema.schema_content}
              </div>
            </div>
          ))}

          {schemas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-white/[0.06] rounded-2xl">
              <div className="text-2xl mb-2 opacity-20">📂</div>
              <div className="text-sm text-white/50">No custom schemas defined yet.</div>
            </div>
          )}

          {activeSchema && (
            <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 animate-fade-in-up">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3 font-serif">
                Schema Details
              </h3>
              <div className="text-white/80 text-sm font-mono bg-[#0A0614]/40 p-3 rounded-xl border border-white/[0.04] whitespace-pre-wrap">
                {activeSchema.schema_content}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Glassmorphism Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center z-[100] animate-fade-in">
          <div className="glass-card rounded-2xl p-6 max-w-sm w-full mx-4 space-y-4 animate-scale-in border border-border/40 shadow-2xl bg-card text-foreground">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/25 text-red-500">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </span>
              <h3 className="font-bold text-foreground text-base font-serif">Confirm Deletion</h3>
            </div>

            <p className="text-xs text-foreground/75 leading-relaxed font-sans">
              Are you sure you want to delete the schema <span className="font-bold">"{schemaNameToDelete}"</span>? All associated tables will be removed.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSchemaIdToDelete(null);
                  setSchemaNameToDelete("");
                }}
                className="px-4 py-2 text-xs font-semibold text-foreground/60 hover:text-foreground bg-foreground/[0.02] hover:bg-foreground/[0.06] border border-border/60 rounded-xl transition-all cursor-pointer"
              >
                No
              </button>
              <button
                onClick={handleConfirmDelete}
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

export default SchemaManager;
