import React from "react";

export default function ScoreSummary({ score, total_score, max_score, passed, message }) {
  return (
    <div className="text-center mb-8">
      <div className={`text-4xl font-bold mb-2 ${passed ? "text-white" : "text-white"}`}>
        {score.toFixed(1)}%
      </div>
      <div className="text-base text-white/70 mb-1">
        {typeof total_score !== "undefined" && typeof max_score !== "undefined"
          ? `${total_score}/${max_score} points`
          : ""}
      </div>
      <div className={`mt-1 font-semibold text-base ${passed ? "text-white" : "text-white"}`}>{message}</div>
    </div>
  );
}