import { useEffect, useState } from "react";

function Sidebar({ selectedSchema }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`glass-card-strong rounded-2xl p-5 transition-all duration-500 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20">
          <svg className="w-3.5 h-3.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
        </span>
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
          Schema Explorer
        </h2>
      </div>

      {!selectedSchema ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="text-2xl mb-2 opacity-30">📋</div>
          <div className="text-sm text-white/30">No schema selected</div>
          <p className="text-xs text-white/20 mt-1">Select a data source to begin</p>
        </div>
      ) : (
        <div className="space-y-2">
          {selectedSchema
            .split(")")
            .filter((item) => item.trim())
            .map((item, index) => {
              const tableName = item.split("(")[0].replace(",", "").trim();
              return (
                <div
                  key={index}
                  className="group flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-300 cursor-default"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/5 border border-purple-500/10 group-hover:bg-purple-500/10 group-hover:border-purple-500/20 transition-all duration-300">
                    <svg className="w-3.5 h-3.5 text-purple-400/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                    </svg>
                  </span>
                  <span className="text-sm text-white/70 font-medium group-hover:text-white/90 transition-colors">
                    {tableName}
                  </span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

export default Sidebar;
