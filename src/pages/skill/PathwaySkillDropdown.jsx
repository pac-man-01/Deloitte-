import React, { useState } from "react";
import { ChevronDown, ChevronUp, ChevronRight, ExternalLink } from "lucide-react";
import { useFetchCoursesMutation, useFetchScrapeCoursesMutation } from "@/redux/services/serviceApi";

export function PathwaySkillDropdown({
    skill_set,
    skill,
    proficiency,
    course,
}) {
    const [open, setOpen] = useState(false);
    const [fetched, setFetched] = useState(false);

    const [fetchCourses, { data: coursesData, error: coursesError, isLoading: isCoursesLoading }] = useFetchCoursesMutation();
    const [fetchScrapeCourses, { data: scrapeData, error: scrapeError, isLoading: isScrapeLoading }] = useFetchScrapeCoursesMutation();

    const [expandedSections, setExpandedSections] = useState({
        udemy: true,
        linkedin: true,
    });

    // Only fetch when opening for the first time
    const handleToggleDropdown = () => {
        const willOpen = !open;
        setOpen(willOpen);
        if (willOpen && !fetched && skill && skill_set && proficiency) {
            fetchCourses({ tech_skill: skill, skill_set: skill_set, level: proficiency.toLowerCase() });
            fetchScrapeCourses({ tech_skill: skill, skill_set: skill_set, level: proficiency.toLowerCase() });
            setFetched(true);
        }
    };

    const toggleSection = (platform) => {
        setExpandedSections((prev) => ({
            ...prev,
            [platform]: !prev[platform],
        }));
    };

    // Helper for rendering course lists (handles both Udemy/API and LinkedIn/scraped)
    const renderCourseList = (data, isLoading, error, label) => (
        <div className="pl-3">
            {isLoading && <div className="text-xs text-muted-foreground">Loading {label} courses...</div>}
            {error && <div className="text-xs text-red-500">Failed to load {label} courses</div>}
            {data && Array.isArray(data.courses) && data.courses.length > 0 ? (
                <ul className="space-y-1">
                    {data.courses.map((c, i) => (
                        <li key={c.id || i} className="flex items-center gap-1">
                            <a
                                href={c.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-semibold text-blue-500 flex items-center gap-1 hover:underline hover:text-blue-700 transition-colors truncate max-w-[180px]"
                                title={c.title || c.name || c.url}
                            >
                                <span className="truncate block">{c.title || c.name || c.url}</span>
                                <ExternalLink size={12} className="inline opacity-70 group-hover:opacity-100" />
                            </a>
                            {c.description && (
                                <div className="text-muted-foreground text-[10px] ml-2 truncate max-w-[180px]" title={c.description}>
                                    {c.description}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (!isLoading && !error) && (
                <div className="text-[10px] text-muted-foreground">No {label} courses found.</div>
            )}
        </div>
    );

    if (!course) {
        return (
            <div className="border-b last:border-b-0 pb-1 last:pb-0">
                <button
                    className="flex items-center w-full justify-between focus:outline-none text-foreground py-1 pl-0 pr-2 rounded transition hover:bg-muted group"
                    onClick={handleToggleDropdown}
                    aria-expanded={open}
                >
                    <span className="font-semibold text-xs text-left w-[90%] flex-1 truncate">
                        {skill}
                        {proficiency ? (
                            <span className="ml-2 text-[10px] text-muted-foreground font-normal whitespace-nowrap">
                                ({proficiency})
                            </span>
                        ) : null}
                    </span>
                    <span className="ml-2 flex-shrink-0">
                        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                </button>
            </div>
        );
    }

    return (
        <div className="border-b last:border-b-0 pb-1 last:pb-0">
            <button
                className="flex items-center w-full justify-between focus:outline-none text-foreground py-1 pl-0 pr-2 rounded transition hover:bg-muted group"
                onClick={handleToggleDropdown}
                aria-expanded={open}
            >
                <span className="font-semibold text-xs text-left w-[90%] flex-1 truncate">
                    {skill}
                    {proficiency ? (
                        <span className="ml-2 text-[10px] text-muted-foreground font-normal whitespace-nowrap">
                            ({proficiency})
                        </span>
                    ) : null}
                </span>
                <span className="ml-2 flex-shrink-0">
                    {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>
            </button>
            {open && (
                <div className="mt-1 text-[11px] text-muted-foreground pl-1 space-y-1 text-left">
                    <div className="flex items-center">
                        <span className="font-medium text-[hsl(var(--chart-4))] mr-1 flex-shrink-0">
                            Course:
                        </span>
                        <span className="truncate max-w-[215px] block" title={course}>
                            {course}
                        </span>
                    </div>
                    {/* Udemy/API Section */}
                    <div className="mt-2">
                        <button
                            type="button"
                            className="flex items-center gap-1 font-semibold text-xs mb-1"
                            onClick={() => toggleSection("udemy")}
                        >
                            {expandedSections.udemy ? (
                                <ChevronDown size={12} />
                            ) : (
                                <ChevronRight size={12} />
                            )}
                            Udemy/API Courses
                        </button>
                        {expandedSections.udemy &&
                            renderCourseList(coursesData, isCoursesLoading, coursesError, "Udemy/API")}
                    </div>
                    {/* LinkedIn/Scrape Section */}
                    <div className="mt-2">
                        <button
                            type="button"
                            className="flex items-center gap-1 font-semibold text-xs mb-1"
                            onClick={() => toggleSection("linkedin")}
                        >
                            {expandedSections.linkedin ? (
                                <ChevronDown size={12} />
                            ) : (
                                <ChevronRight size={12} />
                            )}
                            LinkedIn/Scraped Courses
                        </button>
                        {expandedSections.linkedin &&
                            renderCourseList(scrapeData, isScrapeLoading, scrapeError, "LinkedIn/Scraped")}
                    </div>
                </div>
            )}
        </div>
    );
}