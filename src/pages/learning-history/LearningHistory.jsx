import { useEffect, useState } from "react";
import {
  useFetchLearnerIDMutation,
  useFetchCourseHistoryMutation,
} from "@/redux/services/serviceApi";
import { useAuth } from "@/context/AuthContext";

export default function LearningPath() {
  const {currentUser}=useAuth();
  const [currentEmail, setCurrentEmail] = useState(currentUser.email);
  const [learnerID, setLearnerID] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [fetchLearnerID, { isLoading: isLoadingID }] = useFetchLearnerIDMutation();
  const [fetchCourseHistory, { data: courseHistory, isLoading: isLoadingHistory }] =
    useFetchCourseHistoryMutation();

  useEffect(() => {
    if (currentEmail) {
      fetchLearnerID(currentEmail)
        .unwrap()
        .then((res) => {
          const id = res?.learner_id || res?.learnerID || res?.learnerId;
          if (id) {
            setLearnerID(id);
          }
        })
        .catch(() => { });
    }
  }, [currentEmail, fetchLearnerID]);

  useEffect(() => {
    if (learnerID) {
      fetchCourseHistory(learnerID).unwrap().catch(() => { });
    }
  }, [learnerID, fetchCourseHistory]);

  const parsedCourses = (Array.isArray(courseHistory) ? courseHistory : [])
    .map((course) => {
      const parsedHours = parseFloat(course.learning_hours) || 0;
      const statusRaw = course.action_status?.toLowerCase() || "inprogress";
      const status =
        statusRaw.includes("completed") || statusRaw === "completed"
          ? "Completed"
          : "InProgress";
      return {
        title: course.course_title,
        hours: parsedHours,
        status,
        date: new Date(course.activity_created_on),
      };
    })
    .sort((a, b) => b.date - a.date);

  const totalPages = Math.ceil(parsedCourses.length / itemsPerPage);
  const paginatedCourses = parsedCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalLearningHours = parsedCourses.reduce((sum, course) => sum + course.hours, 0);

  // Status pill colors using Tailwind index variables
  const getStatusStyle = (status) =>
    status === "Completed"
      ? "bg-chart-2 text-background" // chart-2 for completed, text-background for contrast
      : "bg-chart-1 text-background"; // chart-1 for in progress

  // Accent gradient for the card
  const cardGradient =
    "bg-gradient-to-tr from-accent to-secondary border border-border shadow-xl";

  // Glow effect for progress bar
  const glowEffect =
    "bg-primary/10 backdrop-blur-lg shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]";

  if (isLoadingID || isLoadingHistory) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent border-t-transparent"></div>
        <p className="mt-6 text-lg text-muted-foreground">Loading History, please wait...</p>
      </div>
    );
  }

  if (parsedCourses.length === 0) {
    return (
      <div className="text-center text-foreground mt-10">
        No courses found for this learner.
      </div>
    );
  }

  return (
    <div className="flex justify-center px-4 items-start">
      <div
        className={`w-full rounded-3xl p-8 transition-all duration-300`}
        style={{
          boxShadow:
            "0 8px 32px 0 rgba(31,38,135,0.17), 0 1.5px 6px 0 hsl(var(--accent))",
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📚</span>
          <h1 className="text-2xl font-bold text-primary tracking-tight drop-shadow">
            Course Summary
          </h1>
        </div>

        <div className="mb-8 flex flex-col gap-2">
          <p className="text-lg font-semibold text-primary">
            Total Learning Hours:{" "}
            <span className="text-3xl font-extrabold text-chart-2 drop-shadow">
              {totalLearningHours.toFixed(2)}
            </span>
          </p>
          <div className="w-full h-2 rounded-full overflow-hidden bg-muted mt-1">
            <div
              className={`h-full transition-all duration-700 ${glowEffect}`}
              style={{
                width: `${Math.min(
                  100,
                  (totalLearningHours * 2) % 100
                )}%`,
                background:
                  "linear-gradient(90deg, hsl(var(--chart-2)), hsl(var(--chart-1)))",
              }}
            ></div>
          </div>
        </div>

        <ul className="divide-y divide-border">
          {paginatedCourses.map((course, idx) => (
            <li
              key={idx}
              className="flex justify-between items-center py-5 group transition-all duration-200 hover:bg-accent/60 hover:scale-[1.01] rounded-xl px-3"
            >
              <div>
                <p className="text-lg text-card-foreground font-medium group-hover:text-primary transition">
                  {course.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {course.hours} hours • {course.date.toLocaleDateString()}
                </p>
              </div>
              <span
                className={`px-4 py-1 rounded-full text-sm font-bold shadow ${getStatusStyle(
                  course.status
                )} border border-border uppercase tracking-wide transition`}
              >
                {course.status}
              </span>
            </li>
          ))}
        </ul>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-6 mt-8">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded transition hover:bg-accent/80 disabled:opacity-50 border border-border"
          >
            Prev
          </button>
          <span className="text-primary text-base font-semibold tracking-wide">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded transition hover:bg-accent/80 disabled:opacity-50 border border-border"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}