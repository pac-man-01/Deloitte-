import React from "react";
import { LEVEL_DISPLAY } from "./QuizInfo";

export default function FinalScores({ final_scores }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl mt-8 px-8 py-5">
      <h3 className="text-lg font-bold text-white mb-3">Final Scores</h3>
      {Object.entries(final_scores).map(([level, score]) => (
        <div className="flex justify-between text-base py-1 text-white/90" key={level}>
          <span>{LEVEL_DISPLAY[level]}</span>
          <span>{score.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}