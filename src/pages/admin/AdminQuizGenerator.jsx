import { getBaseURL } from "@/utils/getBaseURL";
import React, { useEffect, useState } from "react";

// Example: You may already have a Card, Loader, FormInput, or Section component in your project.
// If so, you can replace the basic HTML with those components as in your MyBadge, AdminForm, etc.

const difficultyOptions = [
  { value: "novice", label: "Novice" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const skillTypeOptions = [
  { value: "technical", label: "Technical" },
  { value: "soft_skill", label: "Soft Skill" },
];

const questionTypeOptions = [
  { value: "mcq", label: "MCQ" },
  { value: "subjective", label: "Subjective" },
];

const AdminQuizGenerator = () => {
  const [form, setForm] = useState({
    topic: "",
    difficulty: "beginner",
    skill_type: "technical",
    managerial_level: "",
    num_questions: 5,
    question_type: "mcq",
  });
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [dbQuestions, setDbQuestions] = useState([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [error, setError] = useState("");
  const [dbError, setDbError] = useState("");

  const backendUrl = ""; // If your API is proxied, leave this empty

  useEffect(() => {
    fetchDbQuestions();
    // eslint-disable-next-line
  }, []);

  const fetchDbQuestions = async () => {
    setDbLoading(true);
    setDbError("");
    try {
      const resp = await fetch(`${getBaseURL()}/assessment1/questions/`);
      const data = await resp.json();
      if (!Array.isArray(data)) throw new Error(data.detail || "Unexpected response");
      setDbQuestions(data);
    } catch (err) {
      setDbError(err.message || "Error loading questions.");
    } finally {
      setDbLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setQuestions([]);
    try {
      const resp = await fetch(`${getBaseURL()}/assessment1/generate_questions_batch/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          managerial_level: form.managerial_level || null,
        }),
      });
      const result = await resp.json();
      if (!Array.isArray(result)) throw new Error(result.detail || "Unexpected response");
      setQuestions(result);
      fetchDbQuestions();
    } catch (err) {
      setError(err.message || "Error generating questions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#18191A] text-[#F5F6FA] font-sans pb-16">
      <header className="bg-[#23272a] flex items-center gap-6 border-b-2 border-[#86BC25] px-7 py-4">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/2/2b/DeloitteNewSmall.png"
          alt="Deloitte Logo"
          className="h-10 filter brightness-110 contrast-115 hover:brightness-125 hover:contrast-125 hover:drop-shadow-[0_0_8px_#86BC25aa] transition"
        />
        <span className="text-[1.09rem] font-normal tracking-wide text-[#bfc7cf]">
          Deloitte Quiz Generator
        </span>
      </header>

      <main className="max-w-3xl mx-auto mt-9 px-5 animate-fade-in-up">
        <h1 className="relative inline-block text-3xl font-semibold mb-6 pb-1 tracking-wide">
          Quiz Generator
          <span className="absolute left-0 bottom-0 h-1 w-full bg-gradient-to-r from-[#86bc25] via-[#86bc25] to-[#6da025] rounded-md animate-underline-bar"></span>
        </h1>

        <form
          className="mt-6 bg-transparent"
          onSubmit={handleGenerate}
          autoComplete="off"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col gap-1">
              <label htmlFor="topic" className="font-medium text-[#BFC7CF]">
                Topic or Keywords
              </label>
              <input
                type="text"
                id="topic"
                name="topic"
                placeholder="e.g. Python, Tax, etc."
                value={form.topic}
                onChange={handleChange}
                className="bg-[#181A1B] border border-[#353535] rounded px-3 py-2 text-[#F5F6FA] focus:outline-none focus:border-[#86BC25] focus:bg-[#131415] transition"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="difficulty" className="font-medium text-[#BFC7CF]">
                Difficulty
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="bg-[#181A1B] border border-[#353535] rounded px-3 py-2 text-[#F5F6FA] focus:outline-none focus:border-[#86BC25] focus:bg-[#131415] transition"
              >
                {difficultyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="skill_type" className="font-medium text-[#BFC7CF]">
                Skill Type
              </label>
              <select
                id="skill_type"
                name="skill_type"
                value={form.skill_type}
                onChange={handleChange}
                className="bg-[#181A1B] border border-[#353535] rounded px-3 py-2 text-[#F5F6FA] focus:outline-none focus:border-[#86BC25] focus:bg-[#131415] transition"
              >
                {skillTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="managerial_level" className="font-medium text-[#BFC7CF]">
                Managerial Level
              </label>
              <input
                type="text"
                id="managerial_level"
                name="managerial_level"
                placeholder="Optional"
                value={form.managerial_level}
                onChange={handleChange}
                className="bg-[#181A1B] border border-[#353535] rounded px-3 py-2 text-[#F5F6FA] focus:outline-none focus:border-[#86BC25] focus:bg-[#131415] transition"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="question_type" className="font-medium text-[#BFC7CF]">
                Question Type
              </label>
              <select
                id="question_type"
                name="question_type"
                value={form.question_type}
                onChange={handleChange}
                className="bg-[#181A1B] border border-[#353535] rounded px-3 py-2 text-[#F5F6FA] focus:outline-none focus:border-[#86BC25] focus:bg-[#131415] transition"
              >
                {questionTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="num_questions" className="font-medium text-[#BFC7CF]">
                Number of Questions
              </label>
              <input
                type="number"
                id="num_questions"
                name="num_questions"
                min="1"
                max="10"
                value={form.num_questions}
                onChange={handleChange}
                className="bg-[#181A1B] border border-[#353535] rounded px-3 py-2 text-[#F5F6FA] focus:outline-none focus:border-[#86BC25] focus:bg-[#131415] transition"
              />
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex items-center bg-[#86BC25] hover:bg-[#6da025] text-white font-medium py-2.5 px-8 rounded mt-3 transition-all duration-150 shadow hover:scale-105"
            disabled={loading}
          >
            {loading && (
              <span className="w-5 h-5 mr-2 border-2 border-white border-t-[#6da025] rounded-full animate-spin"></span>
            )}
            {loading ? "Generating..." : "Generate Questions"}
          </button>
          {error && (
            <div className="text-red-400 mt-3 text-base">{error}</div>
          )}
        </form>

        {/* Generated Questions */}
        <section className="mt-10 animate-fade-in">
          <h2 className="text-xl font-semibold text-[#86bc25] mb-5 border-b border-[#242526] pb-1">
            Generated Questions
          </h2>
          <QuestionList questions={questions} />
        </section>

        {/* All Questions from DB */}
        <section className="mt-11 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#86bc25] border-b border-[#242526] pb-1">
              All Questions
            </h2>
            <button
              onClick={fetchDbQuestions}
              className="bg-[#86BC25] hover:bg-[#6da025] text-white rounded px-4 py-1.5 font-medium text-base transition-all duration-150 hover:scale-105"
              disabled={dbLoading}
            >
              {dbLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          {dbError && (
            <div className="text-red-400 mb-3 text-base">{dbError}</div>
          )}
          <QuestionList questions={dbQuestions} />
        </section>
      </main>

      {/* Animations */}
      <style>
        {`
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(22px);} to { opacity: 1; transform: none;} }
        .animate-fade-in-up { animation: fade-in-up 0.77s cubic-bezier(.19,1,.22,1) 0.18s both;}
        @keyframes underline-bar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .animate-underline-bar { transform-origin: left; animation: underline-bar 1.1s cubic-bezier(.44,.99,.22,1) 0.22s forwards;}
        @keyframes fade-in { from { opacity: 0; transform: translateY(22px);} to { opacity: 1; transform: none;} }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.19,1,.22,1) 0.25s forwards;}
        `}
      </style>
    </div>
  );
};

const QuestionList = ({ questions }) => {
  if (!questions || questions.length === 0)
    return (
      <ul>
        <li className="mb-5 text-gray-400">No questions available.</li>
      </ul>
    );
  return (
    <ul className="space-y-7">
      {questions.map((q, i) => (
        <li
          key={q.id || i}
          style={{ animationDelay: `${0.1 + i * 0.08}s` }}
          className="pb-6 border-b border-[#23272a] bg-transparent animate-fade-in"
        >
          <div className="text-[#86bc25] font-semibold uppercase tracking-wider text-sm mb-1">
            {(q.type || "").toUpperCase()}
          </div>
          <div className="text-base font-medium text-[#F5F6FA] mb-2">
            {q.question || q.question_text || ""}
          </div>
          {q.type === "mcq" && q.options && Array.isArray(q.options) && (
            <ul className="ml-5 mb-2 text-[#BFC7CF] text-base list-disc">
              {q.options.map((opt, idx) => (
                <li key={idx} className="hover:text-[#86BC25] transition">{opt}</li>
              ))}
            </ul>
          )}
          <div className="text-[#BFC7CF] text-base mt-1 flex items-center">
            <span>Correct Answer:</span>
            <span
              className={`ml-2 font-semibold text-white ${
                q.type === "mcq" ? "text-[#86BC25] animate-pulse" : ""
              }`}
            >
              {q.answer || q.correct_option || "—"}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default AdminQuizGenerator;