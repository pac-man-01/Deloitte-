import React from 'react';
import { ExternalLink } from 'lucide-react';

export function CourseCard({
  course,
  platformMeta,
  isSelected,
  onToggleSelect,
}) {
  const url =
    course.url ||
    course.link ||
    course.course_url ||
    course.external_url ||
    '#';

  return (
    <div className="border rounded-lg bg-card p-5 shadow-sm flex flex-col gap-3 h-full transition-all">
      {/* Row: Selection Circle + Title */}
      <div className="flex items-start gap-3">
        {/* Selection Circle */}
        <button
          className={`w-6 h-6 mt-1 rounded-full flex items-center justify-center border-2 transition ${
            isSelected
              ? 'border-green-500 bg-green-500'
              : 'border-muted-foreground bg-background'
          }`}
          aria-label={isSelected ? 'Deselect course' : 'Select course'}
          onClick={e => {
            e.stopPropagation();
            onToggleSelect(course.courseId);
          }}
          type="button"
        >
          {isSelected && <span className="w-3 h-3 rounded-full bg-white block"></span>}
        </button>
        {/* Title and Platform */}
        <div className="flex flex-col flex-1">
          <h3 className="font-semibold text-sm text-foreground break-words">
            {course.title || course.name}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${platformMeta?.badge || ''}`}
            >
              {platformMeta?.icon}
              {platformMeta?.label}
            </span>
            {url && url !== '#' && (
              <a
                href={url}
                onClick={e => e.stopPropagation()}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-accent-foreground hover:underline"
                title={`Go to course on ${platformMeta?.label || 'Website'}`}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
      {/* Description */}
      <div>
        <p className="text-base text-muted-foreground">
          {course.description}
        </p>
      </div>
    </div>
  );
}