import { getBaseURL } from "@/utils/getBaseURL";
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import Loading from "./Loading";
import QuizInfo from "./QuizInfo";
import LevelIndicator from "./LevelIndicator";
import QuestionCard from "./QuestionCard";
import ScoreSummary from "./ScoreSummary";
import DetailedResults from "./DetailedResults";
import FinalScores from "./FinalScores";

export default function QuizApp() {
  // Use React Router hooks
  const { skill } = useParams(); // dynamic segment from /assessment/:skill
  const [searchParams] = useSearchParams();

  // State
  const [page, setPage] = useState("start");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [topic, setTopic] = useState("");
  const [questionType, setQuestionType] = useState("mixed");
  const [level, setLevel] = useState("beginner");
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [detailedVisible, setDetailedVisible] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);

  // Parse URL on mount or when skill/searchParams change
  useEffect(() => {
    // Get query params
    const type = searchParams.get("type") || "mixed";
    const lvl = searchParams.get("level") || "beginner";

    // If no skill is present, show error/start
    if (!skill || !skill.trim()) {
      setPage("start");
      setTopic("");
      setQuestionType(type);
      setLevel(lvl);
      return;
    }

    // Clean up topic value for display
    const decodedSkill = decodeURIComponent(skill);
    setTopic(decodedSkill.split('-').join(' ').toLowerCase());
    setQuestionType(type);
    setLevel(lvl);

    // Auto-start quiz
    async function autoStartQuiz() {
      setLoading(true);
      setLoadingText("Generating questions...");
      setPage("quiz");
      try {
        const formData = new FormData();
        formData.append("topic", decodedSkill);
        formData.append("question_type", type);
        formData.append("level", lvl);
        const res = await fetch(`${getBaseURL()}/start_quiz`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setSessionId(data.session_id);
        setQuestions(data.questions);
        setLevel(data.level ?? lvl);
        setAnswers(Array(data.questions.length).fill(""));
        setResult(null);
        setCurrentProgress(0);
      } catch (err) {
        alert(err.message);
        setPage("start");
      } finally {
        setLoading(false);
        setLoadingText("");
      }
    }

    autoStartQuiz();
    // Only run on mount, or when skill/type/level change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill, searchParams]);

  function handleAnswerChange(idx, value) {
    setAnswers((old) => {
      const next = old.slice();
      next[idx] = value;
      return next;
    });
  }

  async function handleSubmitQuiz() {
    setLoading(true);
    setLoadingText("Evaluating answers...");
    try {
      for (let i = 0; i < questions.length; i++) {
        const answer = answers[i];
        if (typeof answer !== "undefined" && answer !== "") {
          const formData = new FormData();
          formData.append("session_id", sessionId);
          formData.append("question_index", i);
          formData.append("answer", answer);
          await fetch(`${getBaseURL()}/submit_answer`, {
            method: "POST",
            body: formData,
          });
        }
      }
      const formData = new FormData();
      formData.append("session_id", sessionId);
      const res = await fetch(`${getBaseURL()}/submit_quiz`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);

      if (data.quiz_completed) setCurrentProgress(100);
      else if (data.next_level === "intermediate") setCurrentProgress(33);
      else if (data.next_level === "advanced") setCurrentProgress(66);
      else setCurrentProgress(0);

      setPage("result");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  }

  function handleContinueQuiz() {
    if (!result) return;
    setQuestions(result.questions);
    setLevel(result.next_level);
    setAnswers(Array(result.questions.length).fill(""));
    setResult(null);
    setDetailedVisible(false);
    setPage("quiz");
  }

  function handleRetryLevel() {
    if (!result) return;
    setQuestions(result.questions);
    setAnswers(Array(result.questions.length).fill(""));
    setResult(null);
    setDetailedVisible(false);
    setPage("quiz");
  }

  function handleNewQuiz() {
    // reloads to accept fresh skill/type/level from URL
    if (typeof window !== "undefined") {
      window.location.reload();
      return;
    }
    setPage("start");
    setTopic("");
    setQuestionType("mixed");
    setSessionId(null);
    setQuestions([]);
    setLevel("beginner");
    setAnswers([]);
    setResult(null);
    setDetailedVisible(false);
    setCurrentProgress(0);
  }

  // JSX
  return (
    <div className="px-2">
      <div className="mx-auto rounded-2xl shadow-xl px-4">
        <div className="mb-4">
          <h1 className="text-center font-extrabold text-2xl text-white tracking-wide mb-2 drop-shadow-lg">
            Assessment
          </h1>
          <p className="text-center text-zinc-300 text-sm mb-1">
            GIve this test and pass to increase your level
          </p>
          <ProgressBar percent={currentProgress} />
        </div>
        <div className="">
          <Loading show={loading} text={loadingText} />

          {/* Quiz Area */}
          {page === "quiz" && !loading && (
            <div id="quizArea" className="quiz-area w-full">
              <QuizInfo topic={topic} questionType={questionType} level={level} />
              <LevelIndicator />
              <div id="questionsContainer">
                {questions.map((q, idx) => (
                  <QuestionCard
                    key={idx}
                    q={q}
                    index={idx}
                    total={questions.length}
                    value={answers[idx]}
                    onChange={v => handleAnswerChange(idx, v)}
                  />
                ))}
              </div>
              <div className="quiz-controls flex justify-end">
                <button
                  className="bg-white text-black font-bold py-1 px-2 rounded-lg text-sm shadow hover:bg-black hover:text-white border-2 border-white transition-all duration-200"
                  onClick={handleSubmitQuiz}
                  id="submitBtn"
                  type="button"
                >
                  Submit Quiz
                </button>
              </div>
            </div>
          )}

          {/* Result Card */}
          {page === "result" && result && !loading && (
            <div id="resultCard" className="result-card w-full">
              <ScoreSummary
                score={result.score}
                total_score={result.total_score}
                max_score={result.max_score}
                passed={result.passed}
                message={result.message}
              />
              {result.detailed_results && (
                <div className="text-center my-2">
                  <button
                    className="inline-block bg-zinc-900 text-white font-semibold py-1 px-3 rounded border border-white hover:bg-white hover:text-black transition"
                    onClick={() => setDetailedVisible(v => !v)}
                    id="toggleResultsBtn"
                    type="button"
                  >
                    {detailedVisible ? "Hide Detailed Results" : "Show Detailed Results"}
                  </button>
                </div>
              )}
              {detailedVisible && result.detailed_results && (
                <DetailedResults results={result.detailed_results} questions={questions} />
              )}
              {result.quiz_completed && result.final_scores && (
                <FinalScores final_scores={result.final_scores} />
              )}
              <div className="text-center mt-4">
                {result.quiz_completed ? (
                  <button
                    className="inline-block bg-white text-black font-bold py-2 px-4 rounded-lg text-base shadow hover:bg-black hover:text-white border-2 border-white transition-all duration-200"
                    onClick={handleNewQuiz}
                    id="newQuizBtn"
                    type="button"
                  >
                    Start New Quiz
                  </button>
                ) : result.passed && result.next_level ? (
                  <button
                    className="inline-block bg-white text-black font-bold py-2 px-4 rounded-lg text-base shadow hover:bg-black hover:text-white border-2 border-white transition-all duration-200"
                    onClick={handleContinueQuiz}
                    id="continueBtn"
                    type="button"
                  >
                    Continue to Next Level
                  </button>
                ) : (
                  <button
                    className="inline-block bg-white text-black font-bold py-2 px-3 rounded-lg text-base shadow hover:bg-black hover:text-white border-2 border-white transition-all duration-200"
                    onClick={handleRetryLevel}
                    id="retryBtn"
                    type="button"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          )}

          {/* If no skill param, show a message */}
          {page === "start" && !loading && (
            <div className="text-center py-6">
              <h2 className="text-xl font-bold text-white mb-2">Quiz Topic not specified</h2>
              <p className="text-zinc-300 text-sm">
                Please specify a skill in the URL path and type/level as query parameters.<br/>
                <span className="text-zinc-400 text-xs">
                  Example: <code>/home/assessment/sap-system-installation-configuration?type=mcq&amp;level=beginner</code>
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}