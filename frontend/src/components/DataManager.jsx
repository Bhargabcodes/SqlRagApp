import { useEffect, useState } from "react";

function DataManager({ selectedSchema }) {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (!selectedSchema) {
      setTables([]);
      setSelectedTable("");
      setColumns([]);
      setFormData({});
      setRows([]);
      return;
    }

    const parsedTables = selectedSchema
      .split(")")
      .filter((item) => item.trim())
      .map((item) => {
        const cleaned = item.replace(",", "").trim();
        return cleaned.split("(")[0].trim();
      });

    setTables(parsedTables);
  }, [selectedSchema]);

  const handleTableSelect = (tableName) => {
    setSelectedTable(tableName);
    if (!tableName) {
      setColumns([]);
      setFormData({});
      setRows([]);
      return;
    }

    const tableDefinition = selectedSchema
      .split(")")
      .find((item) => item.trim().startsWith(tableName));

    if (!tableDefinition) return;

    const cols = tableDefinition
      .split("(")[1]
      .split(",")
      .map((col) => col.trim().split(" ")[0]);

    setColumns(cols);
    const initialData = {};
    cols.forEach((col) => { initialData[col] = ""; });
    setFormData(initialData);
    fetchTableData(tableName);
  };

  const fetchTableData = async (tableName) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/table/${tableName}`);
      const data = await response.json();
      setRows(data);
    } catch (err) {
      console.log(err);
    }
  };

  const insertRow = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/insert-row", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table_name: selectedTable, data: formData }),
      });
      const data = await response.json();
      alert(data.message || data.error);
      if (data.message) {
        fetchTableData(selectedTable);
        const clearedData = {};
        columns.forEach((col) => { clearedData[col] = ""; });
        setFormData(clearedData);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend");
    }
  };

  const deleteRow = async (row) => {
    const idColumn = Object.keys(row)[0];
    try {
      const response = await fetch("http://127.0.0.1:8000/delete-row", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table_name: selectedTable, row_id: row[idColumn], id_column: idColumn }),
      });
      const data = await response.json();
      alert(data.message || data.error);
      if (data.message) fetchTableData(selectedTable);
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend");
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </span>
        <div>
          <h2 className="text-lg font-semibold text-white/90">Data Manager</h2>
          <p className="text-xs text-white/40 mt-0.5">Insert records into your custom tables</p>
        </div>
      </div>

      <div className="space-y-4">
        <select
          value={selectedTable}
          onChange={(e) => handleTableSelect(e.target.value)}
          className="w-full p-3 glass-input rounded-xl text-white/80 focus:outline-none appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23rgba(255,255,255,0.3)' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: "right 0.75rem center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "1.25rem",
          }}
        >
          <option value="">Select Table</option>
          {tables.map((table) => (
            <option key={table} value={table}>{table}</option>
          ))}
        </select>

        {columns.length > 0 && (
          <div className="space-y-3 mt-4 p-4 rounded-xl bg-white/[0.01] border border-white/[0.04]">
            <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Insert New Record</h4>
            {columns.map((column) => (
              <div key={column}>
                <label className="block text-xs text-white/40 mb-1.5 font-medium">
                  {column}
                </label>
                <input
                  placeholder={`Enter ${column}`}
                  value={formData[column] || ""}
                  onChange={(e) => setFormData({ ...formData, [column]: e.target.value })}
                  className="w-full p-3 glass-input rounded-xl text-white/80 placeholder:text-white/20"
                />
              </div>
            ))}
            <button
              onClick={insertRow}
              className="glass-btn glass-btn-primary w-full mt-2 px-5 py-3 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Insert Row
            </button>
          </div>
        )}

        {selectedTable && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20">
              <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-white/70 text-sm">Table: {selectedTable}</div>
              <div className="text-xs text-white/30 mt-0.5">{rows.length} rows loaded</div>
            </div>
          </div>
        )}

        {rows.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-white/[0.04]">
            <table className="glass-table w-full text-sm">
              <thead>
                <tr>
                  {Object.keys(rows[0]).map((column) => (
                    <th key={column} className="text-left">{column}</th>
                  ))}
                  <th className="text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className="transition-colors duration-200">
                    {Object.values(row).map((value, idx) => (
                      <td key={idx}>{value}</td>
                    ))}
                    <td>
                      <button
                        onClick={() => deleteRow(row)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-300/70 bg-red-500/10 border border-red-500/10 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/20 transition-all duration-200"
                      >
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                          Delete
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataManager;
