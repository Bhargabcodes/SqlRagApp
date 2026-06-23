import LoadingSpinner from "./LoadingSpinner";

function QuestionInput({ question, setQuestion, loading, generateSQL }) {
  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20">
          <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            <path d="M9 10h.01" />
            <path d="M15 10h.01" />
          </svg>
        </span>
        <div>
          <h2 className="text-lg font-semibold text-white/90">
            AI Text-to-SQL
          </h2>
          <p className="text-xs text-white/40 mt-0.5">
            Describe what you want in plain English
          </p>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Example: Find the most expensive product"
          className="
            w-full
            h-28
            glass-input
            rounded-2xl
            p-4
            text-white/80
            resize-none
            placeholder:text-white/20
          "
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-1 text-[10px] text-white/15">
          <span>Enter</span>
          <kbd className="px-1 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[10px] font-mono">↵</kbd>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={generateSQL}
          disabled={loading || !question.trim()}
          className="glass-btn glass-btn-primary px-5 py-2.5 rounded-xl text-sm font-medium text-white flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
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
