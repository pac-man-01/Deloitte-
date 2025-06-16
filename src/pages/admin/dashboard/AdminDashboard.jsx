import React from "react";
import { useNavigate } from "react-router-dom";
 
const adminFeatures = [
    {
        title: "Approve Badges",
        desc: "Review and approve badges earned by employees before they are awarded.",
        icon: (
            <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
            >
                <path
                    d="M12 18.26L18.18 22l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 5.73L5.82 22z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle cx="12" cy="9" r="2" fill="currentColor" />
            </svg>
        ),
    },
    {
        title: "Manage Employees",
        desc: "Add new employees to the system or remove existing ones with a single click.",
        icon: (
            <svg
                className="w-8 h-8 text-chart-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
            >
                <path
                    d="M17 20h5v-2a4 4 0 00-3-3.87M9 20v-2a4 4 0 00-3-3.87M15 7a4 4 0 11-8 0 4 4 0 018 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M23 11h-6m3-3v6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
    },
    {
        title: "View Reports",
        desc: "Monitor employee progress, badge distributions, and learning statistics.",
        icon: (
            <svg
                className="w-8 h-8 text-chart-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
            >
                <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M9 17V9M15 17v-4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
    },
];
 
export default function AdminDashboard() {
    const navigate = useNavigate();
    return (
        <div className="bg-background min-h-[70vh] text-foreground flex flex-col items-center justify-center px-4">
            <div className="w-full rounded-2xl bg-card/80 px-4 transition-all">
                <div className="flex flex-col items-center mb-8">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground mb-4">
                        🛠️ Admin Panel
                    </span>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary mb-2 text-center">
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground text-base md:text-lg text-center max-w-xl">
                        Manage your organization’s learning platform: approve badges, control employee access, and monitor progress all in one place.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    {adminFeatures.map((f, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col items-center bg-accent shadow-sm rounded-xl p-5 transition hover:shadow-md border border-border"
                        >
                            <div className="mb-4">{f.icon}</div>
                            <div className="font-bold text-accent-foreground mb-2 text-lg text-center">{f.title}</div>
                            <div className="text-muted-foreground text-sm text-center">{f.desc}</div>
                        </div>
                    ))}
                </div>
                <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-4">
                    <button
                        className="inline-flex items-center justify-center px-6 py-2 rounded-lg font-semibold text-primary-foreground bg-primary shadow transition hover:bg-primary/90 focus:ring-2 focus:ring-ring focus:outline-none"
                        style={{ borderRadius: "var(--radius)" }}
                        onClick={() => { navigate("approve-badges") }}
                    >
                        Approve Badges
                    </button>
                    <button
                        className="inline-flex items-center justify-center px-6 py-2 rounded-lg font-semibold text-primary bg-secondary border border-border shadow transition hover:bg-secondary/80 focus:ring-2 focus:ring-ring focus:outline-none"
                        style={{ borderRadius: "var(--radius)" }}
                        onClick={() => { navigate("manage-employees") }}
                    >
                        Manage Employees
                    </button>
                    <button
                        className="inline-flex items-center justify-center px-6 py-2 rounded-lg font-semibold text-primary bg-secondary border border-border shadow transition hover:bg-secondary/80 focus:ring-2 focus:ring-ring focus:outline-none"
                        style={{ borderRadius: "var(--radius)" }}
                        onClick={() => { navigate("reports") }}
                    >
                        View Reports
                    </button>
                </div>
            </div>
        </div>
    );
}