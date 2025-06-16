import React from "react";

export default function DetailedResults({ results, questions }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 mt-6 mb-2 shadow-lg text-white">
      <h3 className="font-bold text-white text-lg mb-4">Detailed Results</h3>
      {results.map((result, idx) => {
        let className = "result-item border-l-4 pl-4 py-3 mb-5";
        if (result.type === "mcq") {
          className += result.is_correct ? " border-white" : " border-zinc-700";
        } else {
          const percentage = (result.score / result.max_score) * 100;
          if (percentage >= 80) className += " border-white";
          else if (percentage >= 50) className += " border-zinc-400";
          else className += " border-zinc-700";
        }
        return (
          <div className={className} key={idx}>
            <div className="font-semibold text-base mb-1">
              Question {idx + 1}: {questions[idx].question}
              <span className="float-right text-zinc-400 font-medium">
                {result.score}/{result.max_score} pts
              </span>
            </div>
            <div className="text-zinc-200 text-sm mb-1">
              <span className="font-semibold">Your answer:</span>{" "}
              {result.user_answer || "Not answered"}
              <br />
              <span className="font-semibold">
                {result.type === "mcq" ? "Correct answer" : "Model answer"}:
              </span>{" "}
              {result.type === "mcq"
                ? result.correct_answer
                : result.model_answer}
            </div>
            <div className="text-zinc-400 text-xs">{result.feedback}</div>
          </div>
        );
      })}
    </div>
  );
}