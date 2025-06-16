import React from "react";
import { useNavigate } from "react-router-dom";

const features = [
    {
        title: "Learning Path",
        desc: "Get course recommendations and track your progress with ease.",
        icon: (
            <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
            >
                <path
                    d="M12 20s-8-4.5-8-11a8 8 0 0116 0c0 6.5-8 11-8 11z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle cx="12" cy="9" r="2" fill="currentColor" />
            </svg>
        ),
    },
    {
        title: "Interactive Assessment",
        desc: "Engage with projects and quizzes to see you performance",
        icon: (
            <svg
                className="w-8 h-8 text-chart-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
            >
                <path
                    d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
    },
    {
        title: "Achievements & Certificates",
        desc: "Unlock badges and download certificates as you progress.",
        icon: (
            <svg
                className="w-8 h-8 text-chart-4"
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
            </svg>
        ),
    },
];

export default function Dashboard() {
    const navigate = useNavigate();
    return (
        <div className="bg-background min-h-[70vh] text-foreground flex flex-col items-center justify-center px-4">
            <div className="w-full rounded-2xl bg-card/80 px-4 transition-all">
                <div className="flex flex-col items-center mb-8">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground mb-4">
                        👋 Welcome to
                    </span>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary mb-2 text-center">
                        Your E-Learning Dashboard
                    </h1>
                    <p className="text-muted-foreground text-base md:text-lg text-center max-w-xl">
                        Empower your growth with curated courses, insightful progress, and adaptive learning, all in one place.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    {features.map((f, idx) => (
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
                        onClick={() => { navigate("skills") }}
                    >
                        Skills
                    </button>
                    <button
                        className="inline-flex items-center justify-center px-6 py-2 rounded-lg font-semibold text-primary bg-secondary border border-border shadow transition hover:bg-secondary/80 focus:ring-2 focus:ring-ring focus:outline-none"
                        style={{ borderRadius: "var(--radius)" }}
                        onClick={() => { navigate("learning-history") }}

                    >
                        Learning History
                    </button>
                </div>
            </div>
        </div>
    );
}