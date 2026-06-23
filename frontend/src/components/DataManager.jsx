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
    cols.forEach((col) => {
      initialData[col] = "";
    });

    setFormData(initialData);
    
    fetchTableData(tableName);
  };

  const fetchTableData = async (tableName) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/table/${tableName}`
      );

      const data = await response.json();
      setRows(data);
    } catch (err) {
      console.log(err);
    }
  };

  const insertRow = async () => {
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/insert-row",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          table_name: selectedTable,
          data: formData,
        }),
      }
    );

    const data = await response.json();

    alert(data.message || data.error);

    if (data.message) {
      fetchTableData(selectedTable);

      const clearedData = {};
      columns.forEach((col) => {
        clearedData[col] = "";
      });

      setFormData(clearedData);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to connect to backend");
  }
};
  // --- Step 1: Added Delete Function ---
  const deleteRow = async (row) => {
  const idColumn = Object.keys(row)[0];

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/delete-row",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          table_name: selectedTable,
          row_id: row[idColumn],
          id_column: idColumn,
        }),
      }
    );

    const data = await response.json();

    alert(data.message || data.error);

    if (data.message) {
      fetchTableData(selectedTable);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to connect to backend");
  }
};

  return (
    <div className="bg-[#111827] border border-slate-700 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-2">
        Data Manager
      </h2>

      <p className="text-slate-400 text-sm mb-4">
        Insert records into your custom tables
      </p>

      <div className="space-y-4">
        <select
          value={selectedTable}
          onChange={(e) => handleTableSelect(e.target.value)}
          className="
            w-full
            p-3
            rounded-lg
            bg-slate-800
            border
            border-slate-700
            text-white
            focus:outline-none
            focus:border-blue-500
          "
        >
          <option value="">Select Table</option>

          {tables.map((table) => (
            <option key={table} value={table}>
              {table}
            </option>
          ))}
        </select>

        {columns.length > 0 && (
          <div className="space-y-3 mt-4">
            {columns.map((column) => (
              <div key={column}>
                <label
                  className="
                    block
                    text-sm
                    text-slate-400
                    mb-1
                  "
                >
                  {column}
                </label>

                <input
                  placeholder={`Enter ${column}`}
                  value={formData[column] || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [column]: e.target.value,
                    })
                  }
                  className="
                    w-full
                    p-3
                    rounded-lg
                    bg-slate-800
                    border
                    border-slate-700
                    text-white
                    focus:outline-none
                    focus:border-blue-500
                  "
                />
              </div>
            ))}

            <button
              onClick={insertRow}
              className="
                mt-4
                px-5
                py-3
                rounded-lg
                bg-blue-600
                hover:bg-blue-700
                transition
                text-white
                font-medium
              "
            >
              Insert Row
            </button>
          </div>
        )}

        {selectedTable && (
          <div className="
            p-4
            rounded-lg
            bg-slate-800
            border
            border-slate-700
          ">
            <div className="font-medium text-white">
              Table: {selectedTable}
            </div>
            <div className="text-slate-400 text-sm mt-1">
              {rows.length} rows loaded
            </div>
          </div>
        )}

        {rows.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm border border-slate-700">
              <thead>
                <tr className="bg-slate-800">
                  {Object.keys(rows[0]).map((column) => (
                    <th
                      key={column}
                      className="p-3 text-left border-b border-slate-700"
                    >
                      {column}
                    </th>
                  ))}

                  {/* --- Step 2: Added Actions Header Column --- */}
                  <th
                    className="p-3 text-left border-b border-slate-700"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className="border-b border-slate-800">
                    {Object.values(row).map((value, idx) => (
                      <td key={idx} className="p-3 text-slate-300">
                        {value}
                      </td>
                    ))}

                    {/* --- Step 3: Added Actions Delete Button --- */}
                    <td className="p-3">
                      <button
                        onClick={() => deleteRow(row)}
                        className="
                          px-3
                          py-1
                          rounded
                          bg-red-600
                          hover:bg-red-700
                          text-white
                          text-xs
                        "
                      >
                        Delete
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