import React from "react";
import MCQOption from "./MCQOption";
import cn from "../../utils/cn";

export default function QuestionCard({ q, index, total, value, onChange }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-5 mb-5 shadow-lg w-full">
      <div className="flex justify-between items-baseline mb-2">
        <div className="flex items-center gap-3">
          <div className="font-semibold text-white text-base">Question {index + 1} of {total}</div>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-semibold border border-white",
              q.type === "mcq" ? "bg-zinc-900 text-white" : "bg-zinc-900 text-white"
            )}
          >
            {q.type === "mcq" ? "MCQ" : "ESSAY"}
          </span>
        </div>
        <div className="text-zinc-400 font-medium text-xs">{q.points} pts</div>
      </div>
      <div className="text-white text-base font-medium mb-3">{q.question}</div>
      {q.type === "mcq" ? (
        <ul className="flex flex-col gap-4 w-full">{q.options.map((option, optIdx) => (
          <MCQOption
            key={optIdx}
            option={option}
            checked={value === option}
            onChange={() => onChange(option)}
            name={`question_${index}`}
          />
        ))}</ul>
      ) : (
        <>
          <textarea
            className="w-full bg-zinc-900 text-white border border-zinc-800 rounded-lg px-3 py-2 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-white transition resize-vertical min-h-[60px] font-medium"
            name={`question_${index}`}
            placeholder="Type your answer here... (Be detailed and specific)"
            value={value || ""}
            onChange={e => onChange(e.target.value)}
          />
          <div
            className="mt-1 mb-1 text-right text-xs font-medium"
            style={{
              color:
                !value || value.length < 50
                  ? "#a1a1aa"
                  : value.length < 150
                  ? "#e5e5e5"
                  : "#fff",
            }}
          >
            {value ? value.length : 0} characters
          </div>
        </>
      )}
    </div>
  );
}