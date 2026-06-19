import { useEffect, useState } from "react";

function Sidebar({ selectedSchema }) {
  console.log("SIDEBAR SCHEMA:", selectedSchema);
  return (
    <div className="bg-[#111827] border border-slate-700 rounded-xl p-5">
      <h2 className="text-lg font-semibold text-white mb-2">
        Schema Explorer
      </h2>

      {!selectedSchema ? (
        <div className="text-slate-400 text-sm">
          No schema selected
        </div>
      ) : (
        <div className="space-y-3">
          {selectedSchema
            .split(")")
            .filter((item) => item.trim())
            .map((item, index) => {
              const tableName = item
                .split("(")[0]
                .replace(",", "")
                .trim();

              return (
                <div
                  key={index}
                  className="
                    p-3
                    rounded-lg
                    bg-slate-800
                    border
                    border-slate-700
                    text-white
                  "
                >
                  📁 {tableName}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

export default Sidebar;