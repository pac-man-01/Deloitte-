import React, { useState, useEffect } from "react";
import axios from "axios";
import { getBaseURL } from "@/utils/getBaseURL";
import { useAuth } from "@/context/AuthContext";

// Status meta (for navigation tabs)
const statusOrder = ["all", "pending", "approved", "rejected"];
const statusColor = {
  approved: "text-green-700",
  rejected: "text-red-600",
  pending: "text-yellow-700",
  all: "text-primary",
};
const statusRing = {
  approved: "ring-2 ring-green-200 dark:ring-green-700",
  rejected: "ring-2 ring-red-200 dark:ring-red-700",
  pending: "ring-2 ring-yellow-200 dark:ring-yellow-600",
  all: "ring-2 ring-primary/30 dark:ring-primary/40",
};
const statusIcon = {
  approved: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#E6F9ED" />
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="#16a34a"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M8.5 12.5l2.2 2.2 4-4"
        stroke="#16a34a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  ),
  rejected: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#FAE6E8" />
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="#dc2626"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M9.5 9.5l5 5M14.5 9.5l-5 5"
        stroke="#dc2626"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  ),
  pending: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#FFF9E6" />
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="#eab308"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M12 8v4l2 2"
        stroke="#eab308"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  ),
  all: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <rect
        x="4"
        y="7"
        width="16"
        height="10"
        rx="2"
        className="text-primary/20 fill-primary/10 dark:fill-primary/20"
      />
      <path
        d="M9 11h6M9 15h6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};
const statusLabel = {
  approved: "Approved",
  rejected: "Rejected",
  pending: "Pending",
  all: "All",
};

// Status dot/tag for table rows (admin style, no bg, no border, no animation in tag)
const StatusDot = ({ status }) => {
  let color = "bg-yellow-400";
  let text = "Pending";
  if (status === "approved") {
    color = "bg-green-500";
    text = "Approved";
  } else if (status === "rejected") {
    color = "bg-red-500";
    text = "Rejected";
  }
  return (
    <span className="flex items-center gap-2 justify-center">
      <span className={`inline-block w-3 h-3 rounded-full ${color}`}></span>
      <span className="capitalize text-xs font-medium">{text}</span>
    </span>
  );
};

const MySkillBadgeApplications = () => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState("pending");

  useEffect(() => {
    const fetchApplications = async () => {
      if (!currentUser?.email) {
        setApplications([]);
        setError("You must be logged in to view your applications.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `${getBaseURL()}/skill-badges/applications`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        // Filter by current user's email (case-insensitive, trimmed)
        const filtered = res.data.filter(
          (app) =>
            app.user_email &&
            app.user_email.trim().toLowerCase() ===
              currentUser.email.trim().toLowerCase()
        );
        setApplications(filtered);
      } catch (err) {
        setError("Failed to fetch applications.");
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [currentUser?.email]);

  // Get applications for selected status
  const getStatusApps = (status) =>
    status === "all"
      ? applications
      : applications.filter(
          (app) =>
            (app.status ? app.status.toLowerCase() : "pending") === status
        );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-primary/5 p-4 flex items-center justify-center">
      <div className="w-full max-w-6xl">
        <div className="w-full bg-card/80 backdrop-blur-xl rounded-3xl p-8 border border-border/50 shadow-[0_8px_64px_0_rgba(80,80,120,0.15)] shadow-primary/5">
          {/* <div className="text-center mb-10">
            <h2 className="text-4xl font-black mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent tracking-tight">
              Your Skill Badge Applications
            </h2>
            <p className="text-muted-foreground text-lg">
              View and track your skill badge application status below
            </p>
          </div> */}
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold mb-2 text-neutral-100 tracking-tight drop-shadow">
              Your Skill Badge Applications
            </h2>
            <p className="text-neutral-300 text-lg">
              View and track your skill badge application status below
            </p>
          </div>
          {!loading && !error && (
            <>
              {/* Tab bar */}
              <div className="flex justify-center gap-2 sm:gap-4 mb-7 flex-wrap">
                {statusOrder.map((status) => {
                  const isActive = selectedTab === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setSelectedTab(status)}
                      className={`
                        group relative px-5 py-2 rounded-full font-semibold border-2 text-base focus:outline-none shadow-md transition-all duration-200
                        flex items-center gap-2
                        ${
                          isActive
                            ? `border-primary bg-primary/10 ${statusColor[status]} ${statusRing[status]} scale-105 z-10`
                            : "border-border bg-muted text-foreground opacity-80 hover:scale-105 hover:z-10"
                        }
                      `}
                      style={{
                        boxShadow: isActive
                          ? "0 2px 16px 0 rgba(0,0,0,0.08)"
                          : "",
                        minWidth: 110,
                      }}
                    >
                      {/* SVG Icon with animated pop on active */}
                      <span
                        className={`
                          flex items-center justify-center w-6 h-6 rounded-full
                          transition-all duration-200
                          ${isActive ? "scale-125 drop-shadow" : ""}
                        `}
                      >
                        {statusIcon[status]}
                      </span>
                      <span className="tracking-wide">
                        {statusLabel[status]}
                      </span>
                      {/* Underline animation */}
                      {isActive && (
                        <span
                          className={`absolute left-4 right-4 -bottom-1 h-1 rounded bg-primary/40 animate-pulse`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              <div>
                <h3
                  className={`
                    text-lg font-bold mb-3 tracking-wide
                    ${statusColor[selectedTab]}
                    text-left
                    flex items-center gap-2
                  `}
                >
                  <span
                    className="inline-block w-1.5 h-6 rounded bg-primary mr-2 animate-pulse"
                    style={{
                      animation:
                        "growFade 1.2s cubic-bezier(.68,-0.55,.27,1.55) infinite alternate",
                    }}
                  />
                  {statusLabel[selectedTab]} Applications
                  <style jsx>{`
                    @keyframes growFade {
                      0% {
                        transform: scaleY(1);
                        opacity: 1;
                      }
                      70% {
                        transform: scaleY(1.3);
                        opacity: 0.65;
                      }
                      100% {
                        transform: scaleY(0.7);
                        opacity: 0.6;
                      }
                    }
                  `}</style>
                </h3>
                {getStatusApps(selectedTab).length === 0 ? (
                  <div className="text-center py-12 bg-muted/30 rounded-2xl border-2 border-dashed border-muted-foreground/30">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="text-muted-foreground text-lg">
                      No {statusLabel[selectedTab].toLowerCase()} applications
                      found.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-border/50 shadow-[0_8px_64px_0_rgba(80,80,120,0.15)] shadow-primary/5 bg-card/50 backdrop-blur-sm">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-center border-collapse rounded-xl text-sm">
                        <thead className="bg-gradient-to-r from-muted/80 to-muted/60 text-muted-foreground">
                          <tr>
                            <th className="px-6 py-4 font-semibold border-b border-border/30">
                              Badge
                            </th>
                            <th className="px-6 py-4 font-semibold border-b border-border/30">
                              Course
                            </th>
                            <th className="px-6 py-4 font-semibold border-b border-border/30">
                              Hours
                            </th>
                            <th className="px-6 py-4 font-semibold border-b border-border/30">
                              Assessment
                            </th>
                            <th className="px-6 py-4 font-semibold border-b border-border/30">
                              Project (mo)
                            </th>
                            <th className="px-6 py-4 font-semibold border-b border-border/30">
                              Certificate
                            </th>
                            <th className="px-6 py-4 font-semibold border-b border-border/30">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {getStatusApps(selectedTab).map((app, index) => (
                            <tr
                              key={app.id}
                              className="hover:bg-primary/5 transition-all duration-300 border-b border-border/20 last:border-b-0 group"
                            >
                              <td className="px-6 py-4 font-semibold">
                                {app.badge_name}
                              </td>
                              <td className="px-6 py-4">{app.course_name}</td>
                              <td className="px-6 py-4">
                                {app.hours_completed}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={
                                    app.assessment_status
                                      ? "inline-flex items-center gap-1 text-green-700 font-semibold"
                                      : "inline-flex items-center gap-1 text-red-600 font-semibold"
                                  }
                                >
                                  <span
                                    className={`inline-block w-2 h-2 rounded-full ${
                                      app.assessment_status
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                    }`}
                                  ></span>
                                  {app.assessment_status ? "Yes" : "No"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {app.project_experience_months ?? "-"}
                              </td>
                              <td className="px-6 py-4">
                                {app.certification_url ? (
                                  <a
                                    href={app.certification_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold hover:bg-blue-200 dark:hover:bg-blue-800 transition-all duration-300 hover:scale-105"
                                  >
                                    <span className="text-sm">🔗</span>
                                    View
                                  </a>
                                ) : (
                                  <span className="text-gray-400">N/A</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <StatusDot
                                  status={
                                    app.status
                                      ? app.status.toLowerCase()
                                      : "pending"
                                  }
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              </div>
              <p className="text-muted-foreground">
                Loading your applications...
              </p>
            </div>
          )}
          {error && (
            <p className="text-center text-red-600 font-semibold py-2">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MySkillBadgeApplications;
