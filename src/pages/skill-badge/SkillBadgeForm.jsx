// Skill Badge Form Code Animated UI

import React, { useState, useEffect } from "react";
import axios from "axios";
import { getBaseURL } from "@/utils/getBaseURL";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";

// Enhanced shadow with gradient
const cardShadow =
  "shadow-[0_8px_64px_0_rgba(80,80,120,0.15)] shadow-primary/5";
const inputShadow = "shadow-[0_2px_16px_0_rgba(80,80,120,0.08)]";

// Enhanced pill with gradient and animation
const badgePillStyle =
  "inline-block px-4 py-2 rounded-full border font-semibold text-xs bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 border-primary/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-300";

// Animated loading dots
const LoadingDots = () => (
  <div className="flex items-center justify-center space-x-1">
    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
  </div>
);

// Enhanced status icon with animations
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
    <span className="flex items-center gap-2 justify-center">
      <span
        className={`inline-block w-3 h-3 rounded-full ${color} ${pulseClass} shadow-lg`}
      ></span>
      <span className="capitalize font-medium">{text}</span>
    </span>
  );
};

// Floating label input component
const FloatingLabelInput = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  readOnly = false,
  options = null,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.toString().length > 0;

  if (type === "select") {
    return (
      <div className="relative group">
        <select
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full px-4 pt-6 pb-2 border-2 rounded-xl bg-background/50 backdrop-blur-sm text-foreground 
            focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 
            transition-all duration-300 ${inputShadow} hover:shadow-lg hover:border-primary/50
            ${hasValue || focused ? "border-primary/30" : "border-border/50"}`}
          required={required}
          {...props}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label
          className={`absolute left-4 transition-all duration-300 pointer-events-none
          ${
            hasValue || focused
              ? "top-2 text-xs text-primary font-semibold"
              : "top-4 text-sm text-muted-foreground"
          }`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        readOnly={readOnly}
        className={`w-full px-4 pt-6 pb-2 border-2 rounded-xl text-foreground 
          focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 
          transition-all duration-300 ${inputShadow} hover:shadow-lg
          ${
            readOnly
              ? "bg-muted/50 cursor-not-allowed border-border/30"
              : `bg-background/50 backdrop-blur-sm hover:border-primary/50 ${
                  hasValue || focused ? "border-primary/30" : "border-border/50"
                }`
          }`}
        required={required}
        {...props}
      />
      <label
        className={`absolute left-4 transition-all duration-300 pointer-events-none
        ${
          hasValue || focused
            ? "top-2 text-xs text-primary font-semibold"
            : "top-4 text-sm text-muted-foreground"
        }`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {!readOnly && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      )}
    </div>
  );
};

const SkillBadgeForm = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    employee_name: currentUser.name,
    badge_name: "",
    course_name: "",
    hours_completed: "",
    assessment_status: false,
    project_experience_months: "",
    certification_url: "",
  });

  const [userApplications, setUserApplications] = useState([]);
  const [fetchingApps, setFetchingApps] = useState(false);

  // Fetch user applications when currentUser.email changes & is valid
  useEffect(() => {
    const fetchApplications = async () => {
      if (!currentUser?.email) {
        setUserApplications([]);
        return;
      }
      setFetchingApps(true);
      try {
        const res = await axios.get(
          `${getBaseURL()}/skill-badges/applications`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        // Filter by email (case-insensitive)
        const filtered = res.data.filter(
          (app) =>
            app.user_email &&
            app.user_email.toLowerCase() ===
              currentUser.email.trim().toLowerCase()
        );
        setUserApplications(filtered);
      } catch (error) {
        setUserApplications([]);
      } finally {
        setFetchingApps(false);
      }
    };

    fetchApplications();
  }, [currentUser?.email]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Always use authenticated user's name and email
      const submitData = {
        ...formData,
        employee_name: currentUser.name,
        user_email: currentUser.email,
        project_experience_months:
          formData.project_experience_months === ""
            ? null
            : Number(formData.project_experience_months),
        hours_completed: Number(formData.hours_completed),
        certification_url:
          formData.certification_url.trim() === ""
            ? null
            : formData.certification_url,
      };
      await axios.post(`${getBaseURL()}/skill-badges/apply`, submitData, {
        headers: { "Content-Type": "application/json" },
      });

      // Show success toast
      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "success",
        title: "Application submitted!",
        showConfirmButton: false,
        timer: 3000,
        customClass: {
          popup: "small-toast",
        },
      });

      setFormData({
        employee_name: currentUser.name,
        badge_name: "",
        course_name: "",
        hours_completed: "",
        assessment_status: false,
        project_experience_months: "",
        certification_url: "",
      });
      // Re-fetch applications
      try {
        const res = await axios.get(
          `${getBaseURL()}/skill-badges/applications`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        const filtered = res.data.filter(
          (app) =>
            app.user_email &&
            app.user_email.toLowerCase() ===
              currentUser.email.trim().toLowerCase()
        );
        setUserApplications(filtered);
      } catch {
        setUserApplications([]);
      }
    } catch (error) {
      // Show error toast
      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "error",
        title: "Failed to submit application!",
        showConfirmButton: false,
        timer: 3000,
        customClass: {
          popup: "small-toast",
        },
      });
    }
  };

  // Sort applications: pending first, then rejected, then approved
  const getSortedApplications = (apps) => {
    const statusOrder = { pending: 0, rejected: 1, approved: 2 };
    return [...apps].sort((a, b) => {
      const aStatus = a.status ? a.status.toLowerCase() : "pending";
      const bStatus = b.status ? b.status.toLowerCase() : "pending";
      return statusOrder[aStatus] - statusOrder[bStatus];
    });
  };

  const badgeOptions = [
    { value: "", label: "Select a badge" },
    { value: "Iron", label: "Iron" },
    { value: "Bronze", label: "Bronze" },
    { value: "Silver", label: "Silver" },
    { value: "Gold", label: "Gold" },
    { value: "Platinum", label: "Platinum" },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-primary/5 p-4 flex items-center justify-center">
      <div className="w-full max-w-6xl">
        <div
          className={`w-full bg-card/80 backdrop-blur-xl rounded-3xl p-8 border border-border/50 ${cardShadow} animate-in slide-in-from-bottom-8 duration-700`}
        >
          {/* Header with enhanced styling */}
          {/* <div className="text-center mb-10">
            <h2 className="w-full text-2xl sm:text-3xl md:text-4xl font-black mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent tracking-tight whitespace-normal break-words">
            </h2>
            <p className="text-muted-foreground text-lg">
            </p>
          </div> */}
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold mb-2 text-neutral-100 tracking-tight drop-shadow">
              Apply for Skill Badge
            </h2>
            <p className="text-neutral-300 text-lg">
              Showcase your expertise and earn recognition
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Employee Name */}
              <FloatingLabelInput
                label="Employee Name"
                name="employee_name"
                value={currentUser.name}
                readOnly
                autoComplete="name"
              />

              {/* Email */}
              <FloatingLabelInput
                label="Email"
                name="user_email"
                type="email"
                value={currentUser.email}
                readOnly
                autoComplete="email"
              />

              {/* Badge Name */}
              <FloatingLabelInput
                label=""
                name="badge_name"
                type="select"
                value={formData.badge_name}
                onChange={handleChange}
                options={badgeOptions}
                required
              />

              {/* Course Name */}
              <FloatingLabelInput
                label="Course Name"
                name="course_name"
                value={formData.course_name}
                onChange={handleChange}
                required
              />

              {/* Hours Completed */}
              <FloatingLabelInput
                label="Hours Completed"
                name="hours_completed"
                type="number"
                value={formData.hours_completed}
                onChange={handleChange}
                required
                min={0}
                step={1}
                onWheel={(e) => e.target.blur()}
              />

              {/* Project Experience */}
              <FloatingLabelInput
                label="Project Experience (months)"
                name="project_experience_months"
                type="number"
                value={formData.project_experience_months}
                onChange={handleChange}
                min={0}
                step={1}
                onWheel={(e) => e.target.blur()}
              />
            </div>

            {/* Certification URL - Full width */}
            <FloatingLabelInput
              label="Certification URL (optional)"
              name="certification_url"
              type="url"
              value={formData.certification_url}
              onChange={handleChange}
            />

            {/* Enhanced Assessment Checkbox */}
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 backdrop-blur-sm">
              <div className="relative">
                <input
                  type="checkbox"
                  name="assessment_status"
                  checked={formData.assessment_status}
                  onChange={handleChange}
                  className="w-6 h-6 text-primary border-2 border-primary/30 rounded-lg focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                  id="assessment_status"
                />
                {formData.assessment_status && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-white text-sm animate-in zoom-in duration-300">
                      ✓
                    </span>
                  </div>
                )}
              </div>
              <label
                htmlFor="assessment_status"
                className="text-base font-semibold select-none cursor-pointer flex items-center gap-2"
              >
                <span className="text-xl">📋</span>
                Assessment Completed
              </label>
            </div>

            {/* Enhanced Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-3 text-lg group"
              >
                <span className="text-2xl group-hover:animate-bounce">🚀</span>
                Submit Application
                <div className="w-6 h-6 border-2 border-transparent group-hover:border-primary-foreground/30 rounded-full group-hover:animate-spin transition-all duration-300"></div>
              </button>
            </div>
          </form>

          {/* Enhanced Applications Table */}
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20">
                <span className="text-xl">📋</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-primary">
                  Your Applications
                </h3>
                <p className="text-muted-foreground">
                  Track your badge application status
                </p>
              </div>
            </div>

            {fetchingApps ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <LoadingDots />
                <p className="text-muted-foreground">
                  Loading your applications...
                </p>
              </div>
            ) : userApplications.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-2xl border-2 border-dashed border-muted-foreground/30">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-muted-foreground text-lg">
                  No applications found for your account.
                </p>
                <p className="text-muted-foreground/70 text-sm mt-2">
                  Submit your first application above to get started!
                </p>
              </div>
            ) : (
              <div
                className={`overflow-hidden rounded-2xl border border-border/50 ${cardShadow} bg-card/50 backdrop-blur-sm`}
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-center border-collapse">
                    <thead className="bg-gradient-to-r from-muted/80 to-muted/60 text-muted-foreground">
                      <tr>
                        <th className="px-6 py-4 font-semibold border-b border-border/30">
                          Badge
                        </th>
                        <th className="px-6 py-4 font-semibold border-b border-border/30">
                          Course
                        </th>
                        <th className="px-6 py-4 font-semibold border-b border-border/30">
                          Status
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
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedApplications(userApplications).map(
                        (app, index) => (
                          <tr
                            key={app.id}
                            className="hover:bg-primary/5 transition-all duration-300 border-b border-border/20 last:border-b-0 group animate-in slide-in-from-left duration-500"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <td className="px-6 py-4">
                              <span className={badgePillStyle}>
                                {app.badge_name}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-medium">
                              {app.course_name}
                            </td>
                            <td className="px-6 py-4">
                              <StatusDot status={app.status} />
                            </td>
                            <td className="px-6 py-4 font-semibold">
                              {app.hours_completed}
                            </td>
                            <td className="px-6 py-4">
                              {app.assessment_status ? (
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-semibold">
                                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                  Yes
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 font-semibold">
                                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                  No
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 font-medium">
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
                                <span className="text-muted-foreground">
                                  N/A
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillBadgeForm;
