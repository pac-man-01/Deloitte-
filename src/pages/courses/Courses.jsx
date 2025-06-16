import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Linkedin, Play } from 'lucide-react';
import { useFetchCoursesMutation, useFetchScrapeCoursesMutation } from '@/redux/services/serviceApi';
import { useLocation, useParams } from 'react-router-dom';
import { CourseCard } from './CourseCard';

const platformMeta = {
  udemy: {
    label: 'Udemy',
    icon: <Play className="w-5 h-5 text-[#A435F0]" />,
    badge: 'bg-[#F3E7FF] text-[#A435F0]',
  },
  linkedin: {
    label: 'LinkedIn',
    icon: <Linkedin className="w-5 h-5 text-[#0077B5]" />,
    badge: 'bg-[#E3F1FB] text-[#0077B5]',
  },
};

export default function Course() {
  const [fetchCourses, { data: coursesData, error, isLoading }] = useFetchCoursesMutation();
  const [fetchScrapeCourses, { data: scrapeCourse, isLoading: linkedinLoading }] = useFetchScrapeCoursesMutation();
  const [selectedCourses, setSelectedCourses] = useState(new Set());
  const [scrapeFetched, setScrapeFetched] = useState(false);

  const { techSkill } = useParams();
  const location = useLocation();

  useEffect(() => {
    if (techSkill) {
      const queryParams = new URLSearchParams(location.search);
      const skillSet = queryParams.get('set');
      const levelRaw = queryParams.get('level');
      const tech_skill = techSkill.replace(/-/g, ' ');
      const skill_set = skillSet?.replace(/-/g, ' ');
      const level = levelRaw || 'expert';
      fetchCourses({ tech_skill, skill_set, level });
    }
    // eslint-disable-next-line
  }, [techSkill, location.search]);

  // Load selected courses from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`selected-courses-${techSkill}`);
    if (saved) setSelectedCourses(new Set(JSON.parse(saved)));
  }, [techSkill]);
  // Save selected courses to localStorage
  useEffect(() => {
    localStorage.setItem(`selected-courses-${techSkill}`, JSON.stringify([...selectedCourses]));
  }, [selectedCourses, techSkill]);

  const toggleCourseSelect = (courseId) => {
    setSelectedCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) newSet.delete(courseId);
      else newSet.add(courseId);
      return newSet;
    });
  };

  // Udemy courses always
  const udemyCourses = coursesData?.courses?.map((course) => ({
    ...course,
    platform: 'udemy',
    courseId: `udemy-${course.name}`,
  })) || [];

  // LinkedIn courses only after fetching
  const linkedinCourses =
    scrapeCourse?.courses?.map((course) => ({
      ...course,
      platform: 'linkedin',
      courseId: `linkedin-${course.title}`,
    })) || [];

  // Count all rendered courses
  const selectedCoursesCount =
    [...udemyCourses, ...(scrapeFetched ? linkedinCourses : [])].filter((course) =>
      selectedCourses.has(course.courseId)
    ).length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin rounded-full h-10 w-10 text-accent" />
        <p className="mt-4 text-base md:text-lg text-muted-foreground">Loading Courses, please wait...</p>
      </div>
    );
  }
  if (error) {
    return <div className="text-center text-red-500 py-6 text-base">Failed to load courses.</div>;
  }
  if (!techSkill || !coursesData) {
    return <div className="text-center py-6 text-base">No data available.</div>;
  }

  return (
    <div className="bg-background w-full">
      <div className="mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 text-left">Learning Catalog</h1>
          <p className="text-base md:text-md text-muted-foreground text-left">
            Comprehensive collection of courses from LinkedIn Learning and Udemy Business
          </p>
        </div>

        {/* Selected Courses Count */}
        <div className="flex items-center gap-2 mb-4 px-2 py-2 rounded-md bg-accent border border-border w-max transition-all">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-foreground text-base font-semibold">
            {selectedCoursesCount} course{selectedCoursesCount !== 1 ? 's' : ''} selected
          </span>
        </div>

        {/* All Courses: Udemy (always), LinkedIn (if loaded) */}
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-3">
          {udemyCourses.length > 0 ? (
            udemyCourses.map((course) => (
              <CourseCard
                key={course.courseId}
                course={course}
                platformMeta={platformMeta[course.platform]}
                isSelected={selectedCourses.has(course.courseId)}
                onToggleSelect={toggleCourseSelect}
              />
            ))
          ) : (
            <div className="text-muted-foreground text-base py-4 animate-fade-in col-span-full">
              No Udemy courses found.
            </div>
          )}

          {/* LinkedIn Courses */}
          {scrapeFetched && (
            <>
              {linkedinLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[10vh] py-8 col-span-full">
                  <Loader2 className="animate-spin h-8 w-8 text-accent" />
                  <span className="mt-2 text-muted-foreground text-base">Loading LinkedIn courses...</span>
                </div>
              ) : linkedinCourses.length > 0 ? (
                linkedinCourses.map((course) => (
                  <CourseCard
                    key={course.courseId}
                    course={course}
                    platformMeta={platformMeta[course.platform]}
                    isSelected={selectedCourses.has(course.courseId)}
                    onToggleSelect={toggleCourseSelect}
                  />
                ))
              ) : (
                <div className="text-muted-foreground text-base py-4 animate-fade-in col-span-full">
                  No LinkedIn courses found.
                </div>
              )}
            </>
          )}
        </div>

        {/* Button to Load LinkedIn Courses */}
        {!scrapeFetched && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => {
                const queryParams = new URLSearchParams(location.search);
                const skillSet = queryParams.get('set');
                const levelRaw = queryParams.get('level');
                const tech_skill = techSkill.replace(/-/g, ' ');
                const skill_set = skillSet?.replace(/-/g, ' ');
                const level = levelRaw || 'expert';
                fetchScrapeCourses({ tech_skill, skill_set, level });
                setScrapeFetched(true);
              }}
              className="px-4 py-2 rounded bg-primary text-primary-foreground text-base font-semibold hover:bg-accent border transition"
            >
              Load LinkedIn Courses
            </button>
          </div>
        )}
      </div>
    </div>
  );
}