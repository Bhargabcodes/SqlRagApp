import React, { useState } from "react";

function HistoryLog({ recentQueries = [], clearHistory, deleteHistoryItem }) {
  const [expandedRow, setExpandedRow] = useState(null);

  // Custom modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState("single"); // 'single' or 'all'
  const [indexToDelete, setIndexToDelete] = useState(null);

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const handleCopySQL = (sql, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sql);
    alert("SQL copied to clipboard!");
  };

  const handleDeleteClick = (index, e) => {
    e.stopPropagation();
    setDeleteType("single");
    setIndexToDelete(index);
    setShowDeleteConfirm(true);
  };

  const handleClearAllClick = () => {
    setDeleteType("all");
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (deleteType === "all") {
      clearHistory();
    } else if (deleteType === "single" && indexToDelete !== null) {
      deleteHistoryItem && deleteHistoryItem(indexToDelete);
    }
    setShowDeleteConfirm(false);
    setIndexToDelete(null);
    setExpandedRow(null);
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6 animate-fade-in-up relative">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-semibold text-emerald-400 font-serif">Session Logs</span>
        </div>

        {recentQueries.length > 0 && (
          <button
            onClick={handleClearAllClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/30 rounded-xl transition-all duration-200 cursor-pointer"
          >
            Clear all history
          </button>
        )}
      </div>

      <div className="overflow-x-auto border border-white/[0.04] rounded-xl bg-[#0A0614]/20">
        {recentQueries.length > 0 ? (
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.06]">
                <th className="p-4 font-semibold text-white/50 text-[10px] uppercase tracking-wider w-[5%]"></th>
                <th className="p-4 font-semibold text-white/50 text-[10px] uppercase tracking-wider w-[35%]">Question</th>
                <th className="p-4 font-semibold text-white/50 text-[10px] uppercase tracking-wider w-[30%]">SQL Query</th>
                <th className="p-4 font-semibold text-white/50 text-[10px] uppercase tracking-wider w-[12%]">Time</th>
                <th className="p-4 font-semibold text-white/50 text-[10px] uppercase tracking-wider w-[10%]">Status</th>
                <th className="p-4 font-semibold text-white/50 text-[10px] uppercase tracking-wider w-[8%] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {recentQueries.map((log, index) => {
                const isExpanded = expandedRow === index;
                return (
                  <React.Fragment key={index}>
                    <tr
                      onClick={() => toggleRow(index)}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <td className="p-4 text-center">
                        <svg
                          className={`w-3.5 h-3.5 text-white/30 transform transition-transform duration-200 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </td>
                      <td className="p-4 font-medium text-white/80 pr-4">{log.question || <span className="opacity-30 italic">Direct SQL editor query</span>}</td>
                      <td className="p-4 font-mono text-[10px] text-teal-400/80 truncate max-w-[280px]" title={log.sql}>
                        {log.sql}
                      </td>
                      <td className="p-4 text-white/40">{log.time}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                          log.status === "Success"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                            : "bg-red-500/10 text-red-400 border border-red-500/15"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={(e) => handleDeleteClick(index, e)}
                          className="p-1.5 text-white/30 hover:text-red-400 bg-transparent hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete log"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-white/[0.01]">
                        <td colSpan="6" className="p-5 border-t border-white/[0.02]">
                          <div className="space-y-4">
                            {/* SQL Section */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Generated SQL Query</span>
                                <button
                                  onClick={(e) => handleCopySQL(log.sql, e)}
                                  className="text-[10px] text-teal-400 hover:text-teal-300 font-semibold cursor-pointer"
                                >
                                  Copy SQL
                                </button>
                              </div>
                              <pre className="p-4 bg-[#0A0614]/50 border border-white/[0.04] rounded-xl text-[11px] font-mono text-teal-300 overflow-x-auto whitespace-pre-wrap">
                                {log.sql}
                              </pre>
                            </div>

                            <div className="flex gap-6 text-[11px] border-t border-white/[0.02] pt-3">
                              {log.duration && (
                                <div>
                                  <span className="text-white/40 block font-semibold uppercase tracking-wider text-[9px] mb-1">Execution Speed</span>
                                  <span className="font-mono text-white/80">{log.duration}</span>
                                </div>
                              )}
                              <div>
                                <span className="text-white/40 block font-semibold uppercase tracking-wider text-[9px] mb-1">Timestamp</span>
                                <span className="text-white/80">{log.time}</span>
                              </div>
                            </div>

                            {/* Extra info */}
                            {log.error && (
                              <div className="space-y-2">
                                <span className="text-[10px] font-bold text-red-400/70 uppercase tracking-wider">Error Details</span>
                                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-xs font-mono text-red-300">
                                  {log.error}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-white/30 text-center py-10 italic text-sm">
            No query logs found.
          </div>
        )}
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
              {deleteType === "all"
                ? "Are you sure you want to clear all history? This action is permanent and cannot be undone."
                : "Are you sure you want to delete this query log from your history?"}
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setIndexToDelete(null);
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

export default HistoryLog;
