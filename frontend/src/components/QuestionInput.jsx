import LoadingSpinner from "./LoadingSpinner";

function QuestionInput({ question, setQuestion, loading, generateSQL }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      generateSQL();
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
          <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            <path d="M9 10h.01" />
            <path d="M15 10h.01" />
          </svg>
        </span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Natural language to SQL
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Describe what you need in plain English
          </p>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Find the 5 most expensive products in the electronics category where stock is above 10"
          className="
            w-full
            h-28
            glass-input
            rounded-2xl
            p-4
            text-foreground
            resize-none
            placeholder:text-muted-foreground/30
          "
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M7 8h.01M12 8h.01M17 8h.01M7 12h.01M12 12h.01M17 12h.01M8 16h8" />
          </svg>
          <span>Cmd ↵ to generate</span>
        </div>

        <button
          onClick={generateSQL}
          disabled={loading || !question.trim()}
          className="glass-btn glass-btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
              <span>Generate SQL</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default QuestionInput;
