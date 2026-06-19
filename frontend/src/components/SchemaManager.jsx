import { useEffect, useState } from "react";

function SchemaManager({ selectedSchema, setSelectedSchema }) {
  const [schemaName, setSchemaName] = useState("");
  const [schemaContent, setSchemaContent] = useState("");
  const [schemas, setSchemas] = useState([]);
  const [activeSchema, setActiveSchema] = useState(null);

  const fetchSchemas = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/schemas"
      );

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
      await fetch(
        "http://127.0.0.1:8000/save-schema",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            schema_name: schemaName,
            schema_content: schemaContent,
          }),
        }
      );

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
      await fetch(
        `http://127.0.0.1:8000/schema/${schemaId}`,
        {
          method: "DELETE",
        }
      );

      setSelectedSchema("");
      fetchSchemas();

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="bg-[#111827] border border-slate-700 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-2 text-white">
        Schema Manager
      </h2>

      <p className="text-slate-400 text-sm mb-4">
        Manage database schemas
      </p>

      <div className="space-y-3">
        <input
          value={schemaName}
          onChange={(e) => setSchemaName(e.target.value)}
          placeholder="Schema Name"
          className="
            w-full
            p-3
            bg-[#0F172A]
            border
            border-slate-700
            rounded-xl
            text-white
            placeholder-slate-500
            focus:outline-none
            focus:border-blue-500
          "
        />

        <textarea
          value={schemaContent}
          onChange={(e) => setSchemaContent(e.target.value)}
          placeholder="products(id,name,price)"
          className="
            w-full
            h-32
            p-3
            bg-[#0F172A]
            border
            border-slate-700
            rounded-xl
            text-white
            placeholder-slate-500
            focus:outline-none
            focus:border-blue-500
            resize-none
          "
        />

        <div className="flex justify-end">
          <button
            onClick={saveSchema}
            className="
              px-5
              py-2.5
              rounded-xl
              bg-blue-600
              hover:bg-blue-700
              transition-colors
              font-medium
              text-white
            "
          >
            Save Schema
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-semibold mb-3 text-white">
          Saved Schemas
        </h3>

        <div className="space-y-3">
          {schemas.map((schema) => (
            <div
              key={schema.id}
              onClick={() => {
  setSelectedSchema(schema.schema_content);
  setActiveSchema(schema);
}}
              className={`
                cursor-pointer
                rounded-xl
                p-4
                border
                transition-all
                ${
                  selectedSchema === schema.schema_content
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-700 bg-[#0F172A]/40 hover:bg-[#0F172A]/80"
                }
              `}
            >
              <div className="flex justify-between items-center">
                <div className="font-medium text-blue-400">
                  {schema.schema_name}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Are you sure you want to delete this schema? All associated tables will be removed.")) {
                      deleteSchema(schema.id);
                    }
                  }}
                  className="
                    text-red-400
                    hover:text-red-300
                    text-lg
                    p-1
                    transition-colors
                  "
                  title="Delete Schema"
                >
                  🗑
                </button>
              </div>

              <div className="text-xs text-slate-400 mt-2 font-mono bg-slate-900/50 p-2 rounded border border-slate-800/60 overflow-x-auto whitespace-pre-wrap">
                {schema.schema_content}
              </div>
            </div>
          ))}

          {schemas.length === 0 && (
            <div className="text-sm text-slate-500 text-center py-6 border border-dashed border-slate-800 rounded-xl">
              No custom schemas defined yet.
            </div>
          )}
          {activeSchema && (
  <div
    className="
      mt-6
      rounded-xl
      border
      border-slate-700
      bg-slate-800
      p-5
    "
  >
    <h3 className="text-lg font-semibold text-white mb-3">
      Schema Details
    </h3>

    <div className="text-slate-300 text-sm font-mono whitespace-pre-wrap">
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