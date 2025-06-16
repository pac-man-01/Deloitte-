import React, { useEffect, useState } from "react";
import { getBaseURL } from "@/utils/getBaseURL";
import axios from "axios";
import Swal from "sweetalert2";

// Enhanced shadow and loading dots for admin UI
const cardShadow = "shadow-[0_8px_64px_0_rgba(80,80,120,0.15)] shadow-primary/5";
const inputShadow = "shadow-[0_2px_16px_0_rgba(80,80,120,0.08)]";
const LoadingDots = () => (
  <div className="flex items-center justify-center space-x-1">
    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
  </div>
);

// Status dot/tag for table rows (no border, no bg, just dot & tag, with animation for pending)
const StatusDot = ({ status }) => {
  let color = "bg-yellow-400";
  let text = "Pending";
  let pulseClass = "animate-pulse";
  if (status === "approved") {
    color = "bg-green-500";
    text = "Approved";
    pulseClass = "";
  } else if (status === "rejected") {
    color = "bg-red-500";
    text = "Rejected";
    pulseClass = "";
  }
  return (
    <span className="flex items-center gap-2 ">
      <span className={`inline-block w-3 h-3 rounded-full ${color} ${pulseClass} shadow-lg`}></span>
      <span className="capitalize text-xs font-medium">{text}</span>
    </span>
  );
};

// Debounce hook
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

// Filter Input with icon
const FilterInput = ({ icon, ...props }) => (
  <div className="flex items-center relative">
    <span className="absolute left-3 top-0 bottom-0 flex items-center opacity-50 pointer-events-none">
      {icon}
    </span>
    <input
      {...props}
      className={`pl-9 pr-4 py-2 border-2 rounded-xl w-full bg-background/50 backdrop-blur-sm text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 ${inputShadow} hover:shadow-lg h-12`}
    />
  </div>
);

// Filter Select with icon and custom arrow
const FilterSelect = ({ icon, ...props }) => (
  <div className="flex items-center relative">
    <span className="absolute left-3 top-0 bottom-0 flex items-center opacity-50 pointer-events-none">
      {icon}
    </span>
    <select
      {...props}
      className={`appearance-none pl-9 pr-10 py-2 border-2 rounded-xl w-full bg-background/50 backdrop-blur-sm text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 ${inputShadow} hover:shadow-lg h-12`}
    />
    {/* Custom arrow */}
    <span className="absolute right-3 top-0 bottom-0 flex items-center pointer-events-none opacity-60">
      <svg width="18" height="18" fill="none" stroke="currentColor">
        <path d="M5 8l4 4 4-4" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  </div>
);

const SkillBadgeAdmin = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);

  // filter states
  const [filterEmail, setFilterEmail] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [fetchingApps, setFetchingApps] = useState(false);

  // Debounced values
  const debouncedEmail = useDebounce(filterEmail, 400);
  const debouncedName = useDebounce(filterName, 400);
  const debouncedStatus = useDebounce(filterStatus, 0);

  // Fetch applications once
  useEffect(() => {
    setFetchingApps(true);
    axios
      .get(`${getBaseURL()}/skill-badges/applications`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => setApplications(res.data))
      .catch(() => setApplications([]))
      .finally(() => setFetchingApps(false));
  }, []);

  // Filtering and sorting (pending first)
  const getFilteredApplications = () => {
    let filtered = applications.filter((app) => {
      const email = (app.user_email || "").toLowerCase();
      const name = (app.employee_name || "").toLowerCase();
      const status = (app.status || "pending").toLowerCase();
      if (
        debouncedEmail.trim() &&
        !email.includes(debouncedEmail.trim().toLowerCase())
      ) {
        return false;
      }
      if (
        debouncedName.trim() &&
        !name.includes(debouncedName.trim().toLowerCase())
      ) {
        return false;
      }
      if (debouncedStatus && status !== debouncedStatus) {
        return false;
      }
      return true;
    });

    // Sort: pending first, then rejected, then approved
    const statusOrder = { pending: 0, rejected: 1, approved: 2 };
    filtered = [...filtered].sort((a, b) => {
      const aStatus = a.status ? a.status.toLowerCase() : "pending";
      const bStatus = b.status ? b.status.toLowerCase() : "pending";
      return statusOrder[aStatus] - statusOrder[bStatus];
    });

    return filtered;
  };

  const updateApplicationStatus = (id, newStatus) => {
    setApplications((apps) =>
      apps.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
    setSelectedApp((prev) =>
      prev && prev.id === id ? { ...prev, status: newStatus } : prev
    );
  };

  const handleSelect = (app) => {
    setSelectedApp(app);
  };

  const handleClose = () => {
    setSelectedApp(null);
  };

  // --- SWEETALERT TOASTS FOR ADMIN ACTIONS ---
  const showActionToast = (type) => {
    if (type === "approved") {
      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "success",
        title: "Badge approved and issued!",
        showConfirmButton: false,
        timer: 3000,
        customClass: {
          popup: "small-toast",
        },
      });
    } else if (type === "rejected") {
      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "error",
        title: "Badge application rejected.",
        showConfirmButton: false,
        timer: 3000,
        customClass: {
          popup: "small-toast",
        },
      });
    } else {
      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "error",
        title: "Error updating application status.",
        showConfirmButton: false,
        timer: 3000,
        customClass: {
          popup: "small-toast",
        },
      });
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(
        `${getBaseURL()}/skill-badges/update-status/${id}`,
        { status: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      updateApplicationStatus(id, newStatus);
      showActionToast(newStatus);
    } catch (error) {
      showActionToast("error");
    }
  };

  const handleApprove = (id) => handleStatusChange(id, "approved");
  const handleReject = (id) => handleStatusChange(id, "rejected");

  const filteredApplications = getFilteredApplications();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-primary/5 p-4 flex items-center justify-center">
      <div className="w-full max-w-6xl">
        <div
          className={`w-full bg-card/80 backdrop-blur-xl rounded-3xl p-8 border border-border/50 ${cardShadow}`}
        >
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent tracking-tight">
              Skill Badge Applications <span className="text-base font-medium">(Admin)</span>
            </h2>
            {/* <p className="text-muted-foreground text-lg">Review, approve, or reject employee skill badge applications</p> */}
          </div>

          {/* Filtering Controls */}
          {!selectedApp && (
  <div className="flex flex-col items-center mb-8">
    <div className="w-full max-w-2xl bg-muted/60 p-4 rounded-2xl border border-muted/20 shadow-inner animate-in fade-in duration-700 flex flex-col items-center">
      <div className="flex flex-col md:flex-row w-full gap-6 justify-center items-center">
        <div className="w-full md:w-1/3 min-w-[180px]">
          <FilterInput
            icon={
              <svg width="16" height="16" fill="none" stroke="currentColor">
                <circle cx="7" cy="7" r="5" strokeWidth="2" />
                <path d="m11.5 11.5 2.5 2.5" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
            type="text"
            placeholder="Filter by Email"
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
          />
        </div>
        <div className="w-full md:w-1/3 min-w-[180px]">
          <FilterInput
            icon={
              <svg width="16" height="16" fill="none" stroke="currentColor">
                <path d="M8 11a4 4 0 100-8 4 4 0 000 8z" strokeWidth="2" />
                <path d="M12 12l3 3" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
            type="text"
            placeholder="Filter by Name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
        </div>
        <div className="w-full md:w-1/3 min-w-[160px]">
          <FilterSelect
            icon={
              <svg width="16" height="16" fill="none" stroke="currentColor">
                <circle cx="8" cy="8" r="6" strokeWidth="2" />
                <path d="M8 4v4l2.5 2.5" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            children={statusOptions.map((opt) => (
              <option value={opt.value} key={opt.value}>
                {opt.label}
              </option>
            ))}
          />
        </div>
      </div>
    </div>
  </div>
)}

          {/* Table or Details */}
          {selectedApp ? (
            <div className="mb-8 animate-in fade-in duration-500">
              <h3 className="text-2xl font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">📝</span> Application Details
              </h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mb-3">
                <dt className="font-bold text-muted-foreground">Employee Name:</dt>
                <dd>{selectedApp.employee_name}</dd>
                <dt className="font-bold text-muted-foreground">Email:</dt>
                <dd className="break-all">{selectedApp.user_email}</dd>
                <dt className="font-bold text-muted-foreground">Badge Name:</dt>
                <dd>{selectedApp.badge_name}</dd>
                <dt className="font-bold text-muted-foreground">Course Name:</dt>
                <dd>{selectedApp.course_name}</dd>
                <dt className="font-bold text-muted-foreground">Hours Completed:</dt>
                <dd>{selectedApp.hours_completed}</dd>
                <dt className="font-bold text-muted-foreground">Assessment Completed:</dt>
                <dd>{selectedApp.assessment_status ? "Yes" : "No"}</dd>
                <dt className="font-bold text-muted-foreground">Project Experience (months):</dt>
                <dd>
                  {selectedApp.project_experience_months !== undefined &&
                  selectedApp.project_experience_months !== null &&
                  selectedApp.project_experience_months !== ""
                    ? selectedApp.project_experience_months
                    : "N/A"}
                </dd>
                <dt className="font-bold text-muted-foreground">Certification URL:</dt>
                <dd>
                  {selectedApp.certification_url ? (
                    <a
                      href={selectedApp.certification_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      View Certificate
                    </a>
                  ) : (
                    "N/A"
                  )}
                </dd>
                <dt className="font-bold text-muted-foreground">Status:</dt>
                <dd>
                  <StatusDot status={selectedApp.status} />
                </dd>
              </dl>
              <div className="flex gap-4 mt-7">
                <button
                  onClick={() => handleApprove(selectedApp.id)}
                  disabled={selectedApp.status === "approved"}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50"
                >
                  Approve & Issue Badge
                </button>
                <button
                  onClick={() => handleReject(selectedApp.id)}
                  disabled={selectedApp.status === "rejected"}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50"
                >
                  Reject Application
                </button>
                <button
                  onClick={handleClose}
                  className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-6 py-3 rounded-2xl font-bold ml-auto shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20">
                  <span className="text-xl">📋</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary">All Applications</h3>
                  <p className="text-muted-foreground">Manage employee badge requests below</p>
                </div>
              </div>
              {fetchingApps ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <LoadingDots />
                  <p className="text-muted-foreground">Loading applications...</p>
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-2xl border-2 border-dashed border-muted-foreground/30">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-muted-foreground text-lg">
                    No applications found.
                  </p>
                  <p className="text-muted-foreground/70 text-sm mt-2">
                    No badge applications yet!
                  </p>
                </div>
              ) : (
                <div className={`overflow-hidden rounded-2xl border border-border/50 ${cardShadow} bg-card/50 backdrop-blur-sm`}>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-center border-collapse">
                      <thead className="bg-gradient-to-r from-muted/80 to-muted/60 text-muted-foreground">
                        <tr>
                          <th className="px-6 py-4 font-semibold border-b border-border/30">Employee Name</th>
                          <th className="px-6 py-4 font-semibold border-b border-border/30">Badge</th>
                          <th className="px-6 py-4 font-semibold border-b border-border/30">Course</th>
                          <th className="px-6 py-4 font-semibold border-b border-border/30">Status</th>
                          <th className="px-6 py-4 font-semibold border-b border-border/30">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApplications.map((app, index) => (
                          <tr
                            key={app.id + '-' + index}
                            className="hover:bg-primary/5 transition-all duration-300 border-b border-border/20 last:border-b-0 group"
                            style={{
                              animation: "slideInLeft 0.5s cubic-bezier(.45,.03,.51,.96) both",
                              animationDelay: `${index * 50}ms`,
                            }}
                          >
                            <td className="px-6 py-4 font-medium">{app.employee_name}</td>
                            <td className="px-6 py-4">{app.badge_name}</td>
                            <td className="px-6 py-4">{app.course_name}</td>
                            <td className="px-6 py-4">
                              <StatusDot status={app.status ? app.status.toLowerCase() : "pending"} />
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleSelect(app)}
                                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-2 rounded-xl font-semibold shadow hover:scale-105 hover:shadow-xl transition-all duration-300"
                              >
                                Review
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Custom animation for table rows */}
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-32px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default SkillBadgeAdmin;