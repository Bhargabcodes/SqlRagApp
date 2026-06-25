import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

function DashboardHome({
  user,
  question,
  setQuestion,
  loading,
  generateSQL,
  selectedSchema,
  recentQueries = [],
  setExpandedTables,
  setTablesFolderExpanded,
  setActiveTab,
  username,
}) {
  const getUsername = (email) => {
    if (!email) return "User";
    const namePart = email.split("@")[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  // Parse the schema to show table names and column counts
  const parseSchemaForSummary = (schemaStr) => {
    if (!schemaStr) return [];
    const tables = [];
    const tableRegex = /(\w+)\s*\(([^)]+)\)/g;
    let match;

    while ((match = tableRegex.exec(schemaStr)) !== null) {
      const tableName = match[1];
      const columnsStr = match[2];
      const columnCount = columnsStr.split(",").length;
      tables.push({ name: tableName, columnsCount: columnCount });
    }
    return tables;
  };

  const dbTables = parseSchemaForSummary(selectedSchema);

  // Time periods (7 days in ms)
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const thisWeekQueries = recentQueries.filter((q) => !q.timestamp || q.timestamp >= now - SEVEN_DAYS_MS);
  const lastWeekQueries = recentQueries.filter((q) => q.timestamp && q.timestamp >= now - 2 * SEVEN_DAYS_MS && q.timestamp < now - SEVEN_DAYS_MS);

  // Compute dynamic stats from recentQueries
  const successQueries = recentQueries.filter((q) => q.status === "Success");
  const successRate = recentQueries.length > 0 ? Math.round((successQueries.length / recentQueries.length) * 100) : 0;
  
  const totalResponseTime = recentQueries.reduce((acc, q) => acc + parseFloat(q.duration || 0), 0);
  const avgResponseTime = recentQueries.length > 0 ? (totalResponseTime / recentQueries.length).toFixed(2) + "s" : "0.00s";

  // Dynamic stats bound directly to the cards
  const displayTotalQueries = recentQueries.length;
  const displayTables = dbTables.length;
  const displaySuccessRate = successRate;
  const displayAvgResponseTime = avgResponseTime;

  // 1. Total Queries Trend Calculation
  let queriesTrendText = "No query history";
  let queriesTrendColor = "text-white/30";
  if (recentQueries.length > 0) {
    if (lastWeekQueries.length > 0) {
      const pct = Math.round(((thisWeekQueries.length - lastWeekQueries.length) / lastWeekQueries.length) * 100);
      if (pct > 0) {
        queriesTrendText = `↑ ${pct}% from last week`;
        queriesTrendColor = "text-emerald-400";
      } else if (pct < 0) {
        queriesTrendText = `↓ ${Math.abs(pct)}% from last week`;
        queriesTrendColor = "text-red-400";
      } else {
        queriesTrendText = "0% change from last week";
        queriesTrendColor = "text-white/40";
      }
    } else {
      queriesTrendText = `↑ 100% from last week`;
      queriesTrendColor = "text-emerald-400";
    }
  }

  // 2. Success Rate Trend Calculation
  let successTrendText = "No query history";
  let successTrendColor = "text-white/30";
  if (recentQueries.length > 0) {
    if (lastWeekQueries.length > 0) {
      const thisWeekSuccess = thisWeekQueries.filter(q => q.status === "Success");
      const thisWeekRate = thisWeekQueries.length > 0 ? Math.round((thisWeekSuccess.length / thisWeekQueries.length) * 100) : 0;

      const lastWeekSuccess = lastWeekQueries.filter(q => q.status === "Success");
      const lastWeekRate = lastWeekQueries.length > 0 ? Math.round((lastWeekSuccess.length / lastWeekQueries.length) * 100) : 0;

      const diff = thisWeekRate - lastWeekRate;
      if (diff > 0) {
        successTrendText = `↑ ${diff}% from last week`;
        successTrendColor = "text-emerald-400";
      } else if (diff < 0) {
        successTrendText = `↓ ${Math.abs(diff)}% from last week`;
        successTrendColor = "text-red-400";
      } else {
        successTrendText = "0% change from last week";
        successTrendColor = "text-white/40";
      }
    } else {
      successTrendText = `↑ ${successRate}% from last week`;
      successTrendColor = "text-emerald-400";
    }
  }

  // 3. Response Time Trend Calculation
  let timeTrendText = "No query history";
  let timeTrendColor = "text-white/30";
  if (recentQueries.length > 0) {
    if (lastWeekQueries.length > 0) {
      const thisWeekTotalTime = thisWeekQueries.reduce((acc, q) => acc + parseFloat(q.duration || 0), 0);
      const thisWeekAvg = thisWeekQueries.length > 0 ? thisWeekTotalTime / thisWeekQueries.length : 0;

      const lastWeekTotalTime = lastWeekQueries.reduce((acc, q) => acc + parseFloat(q.duration || 0), 0);
      const lastWeekAvg = lastWeekQueries.length > 0 ? lastWeekTotalTime / lastWeekQueries.length : 0;

      const diff = parseFloat((thisWeekAvg - lastWeekAvg).toFixed(2));
      if (diff < 0) { // negative diff means faster
        timeTrendText = `↓ ${Math.abs(diff)}s from last week`;
        timeTrendColor = "text-emerald-400";
      } else if (diff > 0) { // positive diff means slower
        timeTrendText = `↑ ${diff}s from last week`;
        timeTrendColor = "text-red-400";
      } else {
        timeTrendText = "0.0s change from last week";
        timeTrendColor = "text-white/40";
      }
    } else {
      const currentAvgNum = parseFloat(avgResponseTime);
      timeTrendText = `↓ ${currentAvgNum.toFixed(2)}s from last week`;
      timeTrendColor = "text-emerald-400";
    }
  }

  const displayTablesList = dbTables.length > 0 ? dbTables : [
    { name: "Users", columnsCount: 8 },
    { name: "Orders", columnsCount: 6 },
    { name: "Products", columnsCount: 7 },
    { name: "OrderItems", columnsCount: 5 },
    { name: "Categories", columnsCount: 4 },
  ];

  const historyToShow = recentQueries;

  const handleGenerateClick = async () => {
    if (!question.trim()) return;
    await generateSQL();
    setActiveTab("query");
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Total Queries */}
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider block">
              Total Queries
            </span>
            <span className="text-2xl font-bold text-white/95">
              {displayTotalQueries}
            </span>

          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        </div>

        {/* Card 2: Tables */}
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider block">
              Tables
            </span>
            <span className="text-2xl font-bold text-white/95">
              {displayTables}
            </span>

          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </div>
        </div>

        {/* Card 3: Success Rate */}
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider block">
              Success Rate
            </span>
            <span className="text-2xl font-bold text-white/95">{displaySuccessRate}%</span>

          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
        </div>

        {/* Card 4: Avg Response Time */}
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider block">
              Avg. Response Time
            </span>
            <span className="text-2xl font-bold text-white/95">{displayAvgResponseTime}</span>

          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Grid: Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* Ask a Question Card */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="space-y-1 mb-4">
              <h2 className="text-sm font-semibold text-emerald-400 font-serif">
                Ask a Question
              </h2>
              <p className="text-[11px] text-white/40">
                Ask anything about your database in natural language
              </p>
            </div>

            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Show all users who placed orders in the last 30 days"
              className="w-full h-24 glass-input rounded-xl p-4 text-xs font-mono resize-none placeholder:text-white/20"
            />
          </div>

          <div className="mt-4 flex justify-start">
            <button
              onClick={handleGenerateClick}
              disabled={loading || !question.trim()}
              className="glass-btn glass-btn-primary px-5 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                  </svg>
                  <span>Generate SQL</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Database Schema Summary Card */}
        <div className="rounded-2xl p-5 flex flex-col justify-between bg-[#F1E7D5] text-[#173D35] border border-[#D7D0C0]/50 shadow-lg">
          <div>
            <h2 className="text-sm font-bold text-[#173D35] font-serif">
              Database Schema
            </h2>
            <p className="text-[11px] text-[#173D35]/70 mt-0.5 font-medium">
              View your database structure
            </p>

            <div className="mt-4 space-y-2 max-h-[120px] overflow-y-auto pr-1">
              {displayTablesList.map((tbl) => (
                <div
                  key={tbl.name}
                  onClick={() => {
                    setTablesFolderExpanded(true);
                    setExpandedTables({ [tbl.name]: true });
                    setActiveTab("query");
                  }}
                  className="flex justify-between items-center py-1.5 px-2.5 hover:bg-[#173D35]/5 border border-transparent hover:border-[#173D35]/10 rounded-xl cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-[#173D35]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                    <span className="text-xs font-bold text-[#173D35]/80">{tbl.name}</span>
                  </div>
                  <span className="text-[10px] text-[#173D35]/60 font-semibold">
                    {tbl.columnsCount} {tbl.columnsCount === 1 ? "column" : "columns"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab("query")}
            className="w-full mt-4 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-[#173D35]/80 hover:text-[#173D35] bg-[#173D35]/5 border border-[#173D35]/20 hover:bg-[#173D35]/10 rounded-xl transition-all duration-200 cursor-pointer"
          >
            <span>View Full Schema</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* Recent Queries Card */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white/95 mb-4 font-serif">
              Recent Queries
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.04] text-white/40">
                    <th className="pb-3 font-semibold text-[10px] uppercase tracking-wider w-[40%]">Question</th>
                    <th className="pb-3 font-semibold text-[10px] uppercase tracking-wider w-[35%]">SQL</th>
                    <th className="pb-3 font-semibold text-[10px] uppercase tracking-wider w-[13%]">Time</th>
                    <th className="pb-3 font-semibold text-[10px] uppercase tracking-wider w-[12%]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02] text-white/70">
                  {historyToShow.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-white/30 italic">
                        No queries executed yet.
                      </td>
                    </tr>
                  ) : (
                    historyToShow.slice(0, 3).map((q, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                        <td className="py-3 pr-4 font-medium truncate max-w-[200px]" title={q.question}>
                          {q.question}
                        </td>
                        <td className="py-3 pr-4 font-mono text-[10px] text-teal-400/80 truncate max-w-[180px]" title={q.sql}>
                          {q.sql}
                        </td>
                        <td className="py-3 text-white/40">{q.time}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                            q.status === "Success"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                              : "bg-red-500/10 text-red-400 border border-red-500/15"
                          }`}>
                            {q.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/[0.04] text-center">
            <button
              onClick={() => setActiveTab("history")}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              View All History →
            </button>
          </div>
        </div>

        {/* Tips Card */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.663 17h4.673M12 3v1m6.364.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2 2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </span>
              <h2 className="text-sm font-semibold text-white/95 font-serif">Tips</h2>
            </div>

            <ul className="space-y-3">
              {[
                "Be specific with table and column names",
                "Use natural language questions",
                "You can ask for aggregations, filters, joins",
                "Check the schema if you're unsure",
              ].map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-white/60">
                  <span className="mt-0.5 text-teal-400 flex-shrink-0">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
