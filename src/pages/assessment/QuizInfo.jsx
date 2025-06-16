import React from "react";

const questionTypeDescriptions = {
  mixed: "Mix of multiple-choice and subjective questions for comprehensive assessment",
  mcq_only: "Only multiple-choice questions with instant feedback",
  subjective_only: "Only essay/short answer questions with AI-powered evaluation",
};

const LEVEL_DISPLAY = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

// Smaller badge: px-2 py-0.5 text-xs, border thickness adjusted for clarity
const LEVEL_BADGE_CLASS = {
  beginner: "bg-zinc-900 text-white border border-white px-2 py-0.5 rounded-full font-semibold text-xs",
  intermediate: "bg-zinc-900 text-white border-2 border-white px-2 py-0.5 rounded-full font-semibold text-xs",
  advanced: "bg-zinc-900 text-white border-4 border-white px-2 py-0.5 rounded-full font-semibold text-xs",
};

export default function QuizInfo({ topic, questionType, level }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3 text-white shadow-md text-sm">
      <h4 className="text-base font-bold mb-1 tracking-wide">Quiz Information</h4>
      <p className="mb-0.5">
        <span className="font-semibold">Topic:</span>{" "}
        <span>{topic}</span>
      </p>
      <p className="mb-0.5">
        <span className="font-semibold">Question Type:</span>{" "}
        <span>{questionTypeDescriptions[questionType]}</span>
      </p>
      <p>
        <span className="font-semibold">Level:</span>{" "}
        <span className={LEVEL_BADGE_CLASS[level]}>{LEVEL_DISPLAY[level]}</span>
      </p>
    </div>
  );
}

export { LEVEL_DISPLAY, LEVEL_BADGE_CLASS, questionTypeDescriptions };