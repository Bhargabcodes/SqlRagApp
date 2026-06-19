function QuestionInput({
  question,
  setQuestion,
  loading,
  generateSQL,
}) {
  return (
    <div className="bg-[#111827] border border-slate-700 rounded-xl p-6">

      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">
          AI Text-to-SQL
        </h2>

        <p className="text-sm text-slate-400 mt-1">
          Describe what you want in plain English
        </p>
      </div>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Example: Find the most expensive product"
        className="
          w-full
          h-28
          bg-[#0F172A]
          border
          border-slate-700
          rounded-xl
          p-4
          text-slate-200
          resize-none
          focus:outline-none
          focus:border-blue-500
        "
      />

      <div className="mt-4 flex justify-end">

        <button
          onClick={generateSQL}
          disabled={loading}
          className="
            px-5
            py-2.5
            rounded-xl
            bg-blue-600
            hover:bg-blue-700
            disabled:bg-slate-800
            disabled:text-slate-500
            disabled:cursor-not-allowed
            transition-colors
            font-medium
          "
        >
          {loading ? "Generating..." : "✨ Generate SQL"}
        </button>

      </div>

    </div>
  );
}

export default QuestionInput;