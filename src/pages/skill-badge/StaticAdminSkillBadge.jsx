import React, { useState } from "react";

// Static dummy data for submitted skill badge forms
const staticBadgeApplications = [
  {
    id: 1,
    employee_name: "Alice Johnson",
    user_email: "alice.johnson@example.com",
    badge_name: "Gold",
    course_name: "React Advanced",
    hours_completed: 48,
    assessment_status: true,
    project_experience_months: 5,
    certification_url: "https://certificates.com/alice-gold",
    status: "pending",
  },
  {
    id: 2,
    employee_name: "Bob Smith",
    user_email: "bob.smith@example.com",
    badge_name: "Silver",
    course_name: "Node.js Basics",
    hours_completed: 30,
    assessment_status: false,
    project_experience_months: 2,
    certification_url: "",
    status: "pending",
  },
  // Add more dummy entries as needed
];

const StaticAdminSkillBadge = () => {
  const [applications, setApplications] = useState(staticBadgeApplications);
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const handleSelect = (app) => {
    setSelectedApp(app);
    setActionMessage(null);
  };

  const handleClose = () => {
    setSelectedApp(null);
    setActionMessage(null);
  };

  const handleApprove = (id) => {
    setApplications((apps) =>
      apps.map((app) =>
        app.id === id ? { ...app, status: "approved" } : app
      )
    );
    setActionMessage("✅ Badge approved and issued!");
    setTimeout(() => setActionMessage(null), 2000);
  };

  const handleReject = (id) => {
    setApplications((apps) =>
      apps.map((app) =>
        app.id === id ? { ...app, status: "rejected" } : app
      )
    );
    setActionMessage("❌ Badge application rejected.");
    setTimeout(() => setActionMessage(null), 2000);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl bg-card shadow-xl rounded-2xl p-6 border dark:border-border">
        <h2 className="text-2xl font-bold mb-4 text-primary text-center">
          Skill Badge Applications (Admin)
        </h2>
        {selectedApp ? (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Application Details</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              <dt className="font-medium">Employee Name:</dt>
              <dd>{selectedApp.employee_name}</dd>
              <dt className="font-medium">Email:</dt>
              <dd>{selectedApp.user_email}</dd>
              <dt className="font-medium">Badge Name:</dt>
              <dd>{selectedApp.badge_name}</dd>
              <dt className="font-medium">Course Name:</dt>
              <dd>{selectedApp.course_name}</dd>
              <dt className="font-medium">Hours Completed:</dt>
              <dd>{selectedApp.hours_completed}</dd>
              <dt className="font-medium">Assessment Completed:</dt>
              <dd>{selectedApp.assessment_status ? "Yes" : "No"}</dd>
              <dt className="font-medium">Project Experience (months):</dt>
              <dd>{selectedApp.project_experience_months}</dd>
              <dt className="font-medium">Certification URL:</dt>
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
              <dt className="font-medium">Status:</dt>
              <dd>
                <span
                  className={
                    selectedApp.status === "approved"
                      ? "text-green-600"
                      : selectedApp.status === "rejected"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }
                >
                  {selectedApp.status.charAt(0).toUpperCase() + selectedApp.status.slice(1)}
                </span>
              </dd>
            </dl>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => handleApprove(selectedApp.id)}
                disabled={selectedApp.status === "approved"}
                className="bg-green-600 text-white px-6 py-2 rounded-md font-medium disabled:opacity-60"
              >
                Approve & Issue Badge
              </button>
              <button
                onClick={() => handleReject(selectedApp.id)}
                disabled={selectedApp.status === "rejected"}
                className="bg-red-600 text-white px-6 py-2 rounded-md font-medium disabled:opacity-60"
              >
                Reject Application
              </button>
              <button
                onClick={handleClose}
                className="bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-6 py-2 rounded-md font-medium ml-auto"
              >
                Close
              </button>
            </div>
            {actionMessage && (
              <p className="mt-4 text-center text-base font-semibold">
                {actionMessage}
              </p>
            )}
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-2">Pending Applications</h3>
            <table className="min-w-full bg-white dark:bg-card border rounded-md overflow-hidden text-center">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b">Employee Name</th>
                  <th className="px-4 py-2 border-b">Badge</th>
                  <th className="px-4 py-2 border-b">Course</th>
                  <th className="px-4 py-2 border-b">Status</th>
                  <th className="px-4 py-2 border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6">No applications found.</td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id}>
                      <td className="px-4 py-2 border-b">{app.employee_name}</td>
                      <td className="px-4 py-2 border-b">{app.badge_name}</td>
                      <td className="px-4 py-2 border-b">{app.course_name}</td>
                      <td className="px-4 py-2 border-b">
                        <span
                          className={
                            app.status === "approved"
                              ? "text-green-600"
                              : app.status === "rejected"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }
                        >
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-2 border-b">
                        <button
                          onClick={() => handleSelect(app)}
                          className="bg-primary text-primary-foreground px-4 py-1 rounded-md"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default StaticAdminSkillBadge;