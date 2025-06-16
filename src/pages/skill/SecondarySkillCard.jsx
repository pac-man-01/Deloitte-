import { BookOpen, Star, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SecondarySkillCard = ({ skill, onMoveToDesired }) => {
  // Only show Pathways, no Assessment button
  const navigate=useNavigate();

  const handleCoursesClick = (skill) => {
    const courseName = skill.name.replace(/\s+/g, '-').toLowerCase();
    const skillCategory = skill.category.replace(/\s+/g, '-').toLowerCase();
    const skillLevel = skill.level ? skill.level.toLowerCase() : "beginner";
    navigate(`/home/courses/${courseName}?set=${skillCategory}&level=${skillLevel}`);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex flex-col space-y-3">
        <div className="space-y-1">
          {skill.category && (
            <p className="text-xs text-muted-foreground">Skill Set: {skill.category}</p>
          )}
          <h3 className="font-medium text-foreground text-sm">{skill.name}</h3>
          {skill.level && (
            <p className="text-xs text-muted-foreground">Level: {skill.level}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCoursesClick(skill)}
            className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-xs hover:bg-secondary/80 transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            Courses
          </button>

          {onMoveToDesired && (
            <button
              onClick={() => onMoveToDesired(skill)}
              className="flex items-center gap-1 px-3 py-1.5 border rounded text-xs hover:bg-muted transition"
              title="Move to Desired"
            >
              <Star className="w-4 h-4 text-green-400" />
              Move to Desired
            </button>
          )}
        </div>

        {skill.cert && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Award className="w-3 h-3" />
            {skill.cert}
          </div>
        )}
      </div>
    </div>
  );
};