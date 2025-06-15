import React, { useState, useEffect } from "react";
import { getBaseURL } from "@/utils/getBaseURL";

const difficultyOptions = [
  { value: "", label: "Any" },
  { value: "novice", label: "Novice" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const skillTypeOptions = [
  { value: "", label: "Any" },
  { value: "technical", label: "Technical" },
  { value: "soft_skill", label: "Soft Skill" },
];

const managerialLevelOptions = [
  { value: "", label: "Any" },
  { value: "junior", label: "Junior" },
  { value: "manager", label: "Manager" },
  { value: "senior", label: "Senior" },
];

const questionTypeOptions = [
  { value: "", label: "Any" },
  { value: "mcq", label: "MCQ" },
  { value: "subjective", label: "Subjective" },
];

const defaultUserId = "";

const statBoxes = [
  {
    key: "total_questions_attempted",
    label: "Questions Attempted",
    color: "#86BC25",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="8" stroke="#86BC25" strokeWidth="2" fill="none"/>
        <path d="M7 10l2 2 4-4" stroke="#86BC25" strokeWidth="2" fill="none"/>
      </svg>
    )
  },
  {
    key: "overall_percentage",
    label: "Overall Avg Score",
    color: "#2586bc",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 20 20">
        <path d="M10 2v16M2 10h16" stroke="#2586bc" strokeWidth="2"/>
      </svg>
    )
  },
  {
    key: "mcq_accuracy",
    label: "MCQ Accuracy",
    color: "#bc2586",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 20 20">
        <rect x="3" y="7" width="14" height="6" rx="3" stroke="#bc2586" strokeWidth="2"/>
      </svg>
    )
  },
  {
    key: "subjective_percentage",
    label: "Subjective Avg",
    color: "#e8a20b",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 20 20">
        <ellipse cx="10" cy="10" rx="7" ry="4" stroke="#e8a20b" strokeWidth="2"/>
      </svg>
    )
  },
  {
    key: "recent_performance",
    label: "Recent Performance",
    color: "#0bb8e8",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 20 20">
        <path d="M10 2a8 8 0 1 1-8 8" stroke="#0bb8e8" strokeWidth="2"/>
        <circle cx="10" cy="10" r="2" fill="#0bb8e8"/>
      </svg>
    )
  }
];

// Get recent quiz percentage from the latest quiz attempt, or from the last submitted quiz if available
const getRecentQuizPercentage = (history, quizEval) => {
  // If a new quiz was just submitted and its result is available in quizEval, use that first
  if (
    quizEval &&
    typeof quizEval.percentage_score === "number" &&
    quizEval.total_questions > 0
  ) {
    return quizEval.percentage_score;
  }
  // Otherwise, get from history (latest quiz attempt)
  if (history && Array.isArray(history) && history.length > 0) {
    // Sort by started_at descending
    const sorted = [...history].sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
    const latest = sorted[0];
    if (latest && typeof latest.percentage_score === "number") {
      return latest.percentage_score;
    }
  }
  return undefined;
};

const QuizEmployee = () => {
  const [form, setForm] = useState({
    topic: "Python",
    difficulty: "beginner",
    skill_type: "technical",
    managerial_level: "",
    question_type: "",
    num_questions: 5,
    user_id: defaultUserId,
  });
  const [ratioInfo, setRatioInfo] = useState("");
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizError, setQuizError] = useState("");
  const [quizLoading, setQuizLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [progress, setProgress] = useState(0);

  const [quizEval, setQuizEval] = useState(null);

  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState("");
  const [history, setHistory] = useState([]);
  const [historyError, setHistoryError] = useState("");
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [attemptDetail, setAttemptDetail] = useState(null);
  const [selectedAttemptNumber, setSelectedAttemptNumber] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const { managerial_level, num_questions } = form;
    if (!managerial_level) {
      setRatioInfo("");
      return;
    }
    fetch(
      `${getBaseURL()}/assessment1/managerial_ratio/${encodeURIComponent(managerial_level)}`
    )
      .then((resp) => resp.ok ? resp.json() : Promise.reject())
      .then((ratio) => {
        const softSkill = Math.round(num_questions * ratio.soft_skill_ratio / 100);
        const technical = num_questions - softSkill;
        setRatioInfo(
          `Quiz will include ${softSkill} soft skill and ${technical} technical questions (according to ${managerial_level} ratio).`
        );
      })
      .catch(() => {
        setRatioInfo(
          `No ratio found for "${managerial_level}". Quiz will use your other filters.`
        );
      });
  }, [form.managerial_level, form.num_questions]);

  useEffect(() => {
    if (form.user_id) {
      fetchStats(form.user_id);
    }
    // eslint-disable-next-line
  }, [form.user_id]);

  // When showing history, fetch it
  useEffect(() => {
    if (showHistory && form.user_id) {
      fetchHistory(form.user_id);
    }
    // eslint-disable-next-line
  }, [showHistory, form.user_id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "number" ? Number(value) : value,
    }));
    if (name === "user_id") {
      setQuizQuestions([]);
      setQuizEval(null);
      setSubmitted(false);
    }
  };

  const startQuiz = async (e) => {
    e.preventDefault();
    setQuizLoading(true);
    setQuizError("");
    setQuizQuestions([]);
    setQuizEval(null);
    setSubmitted(false);
    setProgress(0);
    if (!form.user_id || form.user_id.trim() === "") {
      setQuizError("Please enter your User ID before starting the quiz.");
      setQuizLoading(false);
      return;
    }
    try {
      const req = {
        topic: form.topic,
        difficulty: form.difficulty || undefined,
        skill_type: form.skill_type || undefined,
        managerial_level: form.managerial_level || undefined,
        question_type: form.question_type || undefined,
        num_questions: Number(form.num_questions) || 5,
        user_id: form.user_id
      };
      const resp = await fetch(`${getBaseURL()}/assessment1/quiz/start/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req)
      });
      const data = await resp.json();
      if (!Array.isArray(data) || data.length === 0) {
        setQuizError("No questions found for this quiz.");
        setQuizLoading(false);
        return;
      }
      setQuizQuestions(data);
      setQuizLoading(false);
      setProgress(0);
    } catch (err) {
      setQuizError("Error loading quiz: " + err);
      setQuizLoading(false);
    }
  };

  const submitQuizAnswers = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const answers = quizQuestions.map(q => ({
      question_id: q.id,
      user_answer: formData.get("q_" + q.id),
      user_id: form.user_id || undefined
    }));
    setQuizEval(null);
    setSubmitted(true);
    try {
      const resp = await fetch(`${getBaseURL()}/assessment1/quiz/evaluate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
      });
      const data = await resp.json();
      if (data.detail) throw new Error(data.detail);
      setQuizEval(data);
      fetchStats(form.user_id);
    } catch (err) {
      setQuizEval({ error: err.message || "Error evaluating." });
    }
  };

  async function fetchStats(userId) {
    setStatsError("");
    try {
      const resp = await fetch(`${getBaseURL()}/assessment1/stats/user/${encodeURIComponent(userId)}`);
      const stats = await resp.json();
      if (stats.detail) throw new Error(stats.detail);
      setStats(stats);
    } catch (err) {
      setStatsError(err.message || "Error loading stats.");
      setStats(null);
    }
  }

  async function fetchHistory(userId, highlightId = null) {
    setHistoryError("");
    try {
      const resp = await fetch(`${getBaseURL()}/assessment1/quiz/attempts/${encodeURIComponent(userId)}`);
      const data = await resp.json();
      if (!Array.isArray(data)) throw new Error("Unexpected response");
      setHistory(data);
      let attemptIdToSelect = highlightId || (data[0]?.id || null);
      let attemptNumberToSelect = null;
      if (attemptIdToSelect) {
        const idx = data.findIndex(a => a.id === attemptIdToSelect);
        if (idx !== -1) {
          attemptNumberToSelect = data.length - idx;
        }
      }
      setSelectedAttempt(attemptIdToSelect);
      setSelectedAttemptNumber(attemptNumberToSelect);
      if (attemptIdToSelect) fetchAttemptDetail(attemptIdToSelect, attemptNumberToSelect);
    } catch (err) {
      setHistoryError(err.message || "Error loading history.");
      setHistory([]);
    }
  }

  async function fetchAttemptDetail(attemptId, attemptNumber = null) {
    try {
      const resp = await fetch(`${getBaseURL()}/assessment1/quiz/attempt/${attemptId}/evaluations`);
      const evals = await resp.json();
      setAttemptDetail({ evals, attemptNumber });
    } catch (err) {
      setAttemptDetail({ evals: [{ error: err.message || "Error loading attempt details." }], attemptNumber });
    }
  }

  const handleQuizInputChange = () => {
    if (!quizQuestions.length) return;
    let answered = 0;
    quizQuestions.forEach(q => {
      if (q.type === "mcq") {
        if ([...document.querySelectorAll(`input[name="q_${q.id}"]`)].some(r => r.checked)) answered++;
      } else if (q.type === "subjective") {
        if ((document.querySelector(`textarea[name="q_${q.id}"]`)||{}).value?.trim()) answered++;
      }
    });
    setProgress(100 * answered / quizQuestions.length);
  };

  const handleAttemptClick = (attempt, idx, arr) => {
    setSelectedAttempt(attempt.id);
    const attemptNumber = arr.length - idx;
    setSelectedAttemptNumber(attemptNumber);
    fetchAttemptDetail(attempt.id, attemptNumber);
  };

  // Handler for "View Quiz History" button
  const handleShowHistory = () => {
    if (!form.user_id || form.user_id.trim() === "") {
      setStatsError("Please enter your User ID to view your quiz history and statistics.");
      setHistoryError("Please enter your User ID to view your quiz history and statistics.");
      return;
    }
    setShowHistory(true);
  };

  // For rendering Recent Performance in the stats section
  const renderRecentPerformance = () => {
    let percent = getRecentQuizPercentage(history, quizEval);
    // fallback to stats.recent_performance if available and not blank and quizEval/history percent is undefined
    if ((percent === undefined || percent === null) && stats && typeof stats.recent_performance === "number") {
      percent = stats.recent_performance;
    }
    // fallback to latest available percentage in stats.recent_scores
    if ((percent === undefined || percent === null) && stats && Array.isArray(stats.recent_scores) && stats.recent_scores.length > 0) {
      percent = stats.recent_scores[stats.recent_scores.length - 1];
    }
    return percent !== undefined && percent !== null
      ? `${Number(percent).toFixed(1)}%`
      : <span className="opacity-60 text-lg">--</span>;
  };

  return (
    <div className="bg-[#18191A] min-h-screen text-[#F5F6FA] font-sans">
      <header className="bg-[#23272A] px-7 py-4 flex justify-between items-center border-b-2 border-[#86BC25] shadow-md">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/2/2b/DeloitteNewSmall.png"
          alt="Deloitte logo"
          className="h-[42px] bg-transparent brightness-110 contrast-120 mb-[2px] inline-block align-middle"
        />
      </header>
      <main className="max-w-3xl mx-auto mt-9 px-5 pb-16">
        <h1 className="text-3xl font-semibold mb-6 pb-1 border-b-2 border-[#86bc25] inline-block tracking-wide">
          Quiz Portal
        </h1>
        <form className="quiz-form mt-6" onSubmit={startQuiz} autoComplete="off">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col gap-1">
              <label htmlFor="topic" className="font-medium text-[#BFC7CF]">Topic</label>
              <input
                type="text"
                name="topic"
                id="topic"
                className="bg-[#181A1B] border border-[#353535] rounded px-3 py-2 text-[#F5F6FA] focus:outline-none focus:border-[#86BC25] focus:bg-[#131415] transition"
                value={form.topic}
                placeholder="e.g. Python, Cloud, Tax, etc."
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="difficulty" className="font-medium text-[#BFC7CF]">Difficulty</label>
              <select
                name="difficulty"
                id="difficulty"
                className="bg-[#181A1B] border border-[#353535] rounded px-3 py-2 text-[#F5F6FA] focus:outline-none focus:border-[#86BC25] focus:bg-[#131415] transition"
                value={form.difficulty}
                onChange={handleChange}
              >
                {difficultyOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="skill_type" className="font-medium text-[#BFC7CF]">Skill Type</label>
              <select
                name="skill_type"
                id="skill_type"
                className="bg-[#181A1B] border border-[#353535] rounded px-3 py-2 text-[#F5F6FA] focus:outline-none focus:border-[#86BC25] focus:bg-[#131415] transition"
                value={form.skill_type}
                onChange={handleChange}
              >
                {skillTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="managerial_level" className="font-medium text-[#BFC7CF]">Managerial Level</label>
              <select
                name="managerial_level"
                id="managerial_level"
                className="bg-[#181A1B] border border-[#353535] rounded px-3 py-2 text-[#F5F6FA] focus:outline-none focus:border-[#86BC25] focus:bg-[#131415] transition"
                value={form.managerial_level}
                onChange={handleChange}
              >
                {managerialLevelOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="question_type" className="font-medium text-[#BFC7CF]">Question Type</label>
              <select
                name="question_type"
                id="question_type"
                className="bg-[#181A1B] border border-[#353535] rounded px-3 py-2 text-[#F5F6FA] focus:outline-none focus:border-[#86BC25] focus:bg-[#131415] transition"
                value={form.question_type}
                onChange={handleChange}
              >
                {questionTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="num_questions" className="font-medium text-[#BFC7CF]">Number of Questions</label>
              <input
                type="number"
                name="num_questions"
                id="num_questions"
                min="1"
                max="10"
                className="bg-[#181A1B] border border-[#353535] rounded px-3 py-2 text-[#F5F6FA] focus:outline-none focus:border-[#86BC25] focus:bg-[#131415] transition"
                value={form.num_questions}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="user_id" className="font-medium text-[#BFC7CF]">User ID</label>
              <input
                type="text"
                name="user_id"
                id="user_id"
                className="bg-[#181A1B] border border-[#353535] rounded px-3 py-2 text-[#F5F6FA] focus:outline-none focus:border-[#86BC25] focus:bg-[#131415] transition"
                value={form.user_id}
                onChange={handleChange}
                placeholder="Enter your User ID"
                autoFocus
                required
              />
            </div>
          </div>
          <div className="form-actions flex gap-3 items-center mb-2 mt-2">
            <button
              type="submit"
              className="inline-flex items-center bg-[#86BC25] hover:bg-[#6da025] text-white font-medium py-2.5 px-8 rounded transition-all duration-150 shadow hover:scale-105"
              disabled={quizLoading}
            >
              {quizLoading ? (
                <span className="w-5 h-5 mr-2 border-2 border-white border-t-[#6da025] rounded-full animate-spin"></span>
              ) : "Start Quiz"}
            </button>
            <button
              type="button"
              className="bg-transparent border-2 border-[#86BC25] rounded px-6 py-2 text-[#86BC25] font-semibold hover:bg-[#86BC25] hover:text-white transition-all duration-150"
              onClick={handleShowHistory}
            >
              View Quiz History
            </button>
          </div>
        </form>
        {ratioInfo && (
          <div id="ratio-info" className="my-2 font-medium text-[#86BC25] tracking-wide text-base">
            {ratioInfo}
          </div>
        )}
        {/* Quiz Section */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-[#86bc25] mb-3">Quiz</h2>
          <div id="quiz-section">
            {quizError && <div className="text-red-400">{quizError}</div>}
            {!quizQuestions.length && quizLoading && (
              <span className="w-6 h-6 border-2 border-[#86BC25]/20 border-t-[#86BC25] rounded-full animate-spin inline-block" />
            )}
            {quizQuestions.length > 0 && !submitted && (
              <form id="answerQuizForm" onSubmit={submitQuizAnswers}>
                <div className="progress-bar-container bg-[#23272A] rounded overflow-hidden my-4 h-4 w-full shadow">
                  <div className="progress-bar h-full bg-gradient-to-r from-[#86BC25] to-[#b0e84a] transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                {quizQuestions.map((q, idx) => (
                  <div className="quiz-q mb-5 pb-4 border-b border-[#23272A] bg-transparent" key={q.id}>
                    <b className="text-[#86bc25] font-semibold text-base">Q{idx + 1}:</b> {q.question_text}<br />
                    {q.type === "mcq" && q.options && q.options.map(opt => (
                      <label key={opt} className="font-normal mr-5 inline-block text-[#F5F6FA]">
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          value={opt}
                          required
                          onChange={handleQuizInputChange}
                          className="mr-2"
                        />{" "}
                        {opt}
                      </label>
                    ))}
                    {q.type === "subjective" && (
                      <textarea
                        name={`q_${q.id}`}
                        rows={3}
                        required
                        placeholder="Your answer"
                        onChange={handleQuizInputChange}
                        className="w-full min-h-[64px] bg-[#181A1B] text-[#F5F6FA] text-base rounded px-2 py-1 mt-1 border border-[#353535] focus:outline-none focus:border-[#86BC25] transition"
                      />
                    )}
                  </div>
                ))}
                <button
                  type="submit"
                  className="bg-[#86BC25] text-white px-6 py-2 rounded font-medium mt-3 hover:bg-[#6da025] transition-all duration-150"
                >
                  Submit Answers & Get Results
                </button>
              </form>
            )}
            {submitted && <QuizFeedback evalResult={quizEval} />}
          </div>
        </section>
        {/* Statistics */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-[#86bc25] mb-3">Statistics</h2>
          <div id="quiz-stats">
            {/* Stat Summary Cards */}
            <div className="flex flex-wrap gap-5 mb-8">
              {statBoxes.map(box => (
                <div
                  key={box.key}
                  className="flex-1 min-w-[160px] rounded-xl shadow bg-[#23272A] px-5 py-4 flex flex-col items-center justify-center relative border-t-4"
                  style={{ borderColor: box.color }}
                >
                  <div className="mb-1">{box.icon}</div>
                  <div className="text-2xl font-bold" style={{ color: box.color }}>
                    {box.key === "recent_performance"
                      ? renderRecentPerformance()
                      : (stats && typeof stats[box.key] === "number"
                        ? (box.key.includes("percentage") || box.key.includes("accuracy"))
                          ? `${Number(stats[box.key]).toFixed(1)}%`
                          : stats[box.key]
                        : <span className="opacity-60 text-lg">--</span>
                      )
                    }
                  </div>
                  <div className="text-base text-[#BFC7CF] mt-1">{box.label}</div>
                </div>
              ))}
            </div>
            {statsError && <div className="text-red-400">{statsError}</div>}
          </div>
        </section>
        {/* History */}
        {showHistory && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-[#86bc25] mb-3">History</h2>
          <div id="quiz-history">
            {historyError && <div className="text-red-400">{historyError}</div>}
            {history.length === 0 && <b>No quiz history found.</b>}
            {history.length > 0 && (
              <>
                <h3 className="text-lg font-semibold my-2 text-[#86bc25]">Your Quiz Attempts</h3>
                <ul className="attempt-list list-none p-0 mb-0">
                  {history.map((attempt, idx, arr) => (
                    <li key={attempt.id}
                      className={`my-2 py-2 pl-0 pr-5 rounded border-l-4 ${selectedAttempt === attempt.id ? "border-[#86BC25] bg-[#202e18]" : "border-transparent"} cursor-pointer`}
                      onClick={() => handleAttemptClick(attempt, idx, arr)}>
                      <span className={`attempt-link underline text-[#86BC25] text-base font-medium ${selectedAttempt === attempt.id ? "font-bold" : ""}`}>
                        Attempt #{arr.length - idx}
                      </span>
                      <span className="text-[#BFC7CF] ml-2">
                        ({new Date(attempt.started_at).toLocaleString()})
                      </span>
                      {typeof attempt.score === "number" && (
                        <span className="text-[#86BC25] ml-2">Score: {attempt.score}</span>
                      )}
                    </li>
                  ))}
                </ul>
                <div id="selected-attempt-detail">
                  {attemptDetail && <AttemptDetail evals={attemptDetail.evals} attemptNumber={attemptDetail.attemptNumber ?? selectedAttemptNumber} />}
                  {!attemptDetail && <span className="spinner">Loading attempt details...</span>}
                </div>
              </>
            )}
          </div>
        </section>
        )}
      </main>
    </div>
  );
};

const QuizFeedback = ({ evalResult }) => {
  if (!evalResult) return <div><span className="spinner" /> Evaluating...</div>;
  if (evalResult.error) return <div className="text-red-400">{evalResult.error}</div>;
  // Compute integer score for display
  let intScore = (typeof evalResult.total_score === "number")
    ? Math.round(evalResult.total_score)
    : evalResult.total_score;
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold text-[#86bc25] mb-2">Quiz Feedback</h3>
      <b>Score:</b> {intScore} / {evalResult.total_questions}
      {typeof evalResult.percentage_score === "number" && (
        <> ({evalResult.percentage_score.toFixed(1)}%)</>
      )}<br />
      <ol className="ml-6 mt-2">
        {evalResult.evaluations.map((evalItem, idx) => (
          <li key={idx} className={evalItem.is_correct ? "bg-green-950/60" : "bg-red-900/40"} style={{borderRadius: '4px', marginBottom: '10px', padding: '8px'}}>
            <b>Q:</b> {evalItem.question_text}<br />
            <b>Your Answer:</b> {evalItem.user_answer}<br />
            <b>Score:</b> {(evalItem.score * 100).toFixed(1)}%<br />
            <b>
              {evalItem.is_correct
                ? <span className="text-[#86BC25]">Correct</span>
                : <span className="text-red-400">Incorrect</span>
              }
            </b><br />
            <b>Feedback:</b> {evalItem.feedback || "n/a"}<br />
          </li>
        ))}
      </ol>
    </div>
  );
};

const AttemptDetail = ({ evals, attemptNumber }) => {
  if (!evals || evals.length === 0) return <b>No details found for this attempt.</b>;
  if (evals[0]?.error) return <div className="text-red-400">{evals[0].error}</div>;
  return (
    <div className="mt-4">
      <div className="attempt-header bg-[#202123] px-3 py-2 mb-2 font-semibold rounded border-l-4 border-[#86BC25] text-[#F5F6FA]">
        {attemptNumber ? `Attempt #${attemptNumber}` : "Attempt"} ({new Date(evals[0].created_at || Date.now()).toLocaleString()})
      </div>
      <ol className="ml-6">
        {evals.map((evalItem, idx) => (
          <li key={idx} className={evalItem.is_correct ? "bg-green-950/60" : "bg-red-900/40"} style={{borderRadius: '4px', marginBottom: '10px', padding: '8px'}}>
            <b>Q:</b> {evalItem.question_text}<br />
            <b>Your Answer:</b> {evalItem.user_answer}<br />
            <b>Score:</b> {(evalItem.score * 100).toFixed(1)}%<br />
            <b>
              {evalItem.is_correct
                ? <span className="text-[#86BC25]">Correct</span>
                : <span className="text-red-400">Incorrect</span>
              }
            </b><br />
            <b>Feedback:</b> {evalItem.feedback || "n/a"}<br />
          </li>
        ))}
      </ol>
    </div>
  );
};

export default QuizEmployee;
