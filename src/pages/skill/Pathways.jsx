import { PathwaySkillDropdown } from "./PathwaySkillDropdown";

export default function Pathways({ skills, courseMap = {}, desiredSkills = [] }) {
    // Prepare data for each column
    const mandatorySkills = [
        ...(skills.primaryskill ?? []).map((s) => ({
            skill_set: s.skill_set,
            skill: s.name,
            proficiency: s.proficiency || "Beginner",
            course: "Primary",
        })),
        ...(skills.secondaryskill ?? []).map((s) => ({
            skill_set: s.skill_set,
            skill: s.name,
            proficiency: s.proficiency || "Beginner",
            course: "Secondary",
        })),
    ];
    const recommendedSkills = (skills.recommendedskill ?? []).map((s) => ({
        skill_set: s.skill_set,
        skill: s.technical_skill,
        proficiency: "Beginner",
        course: "Recommended",
    }));
    const desiredSkillsData = (desiredSkills ?? []).map((s) => ({
        skill_set: s.skill_set,
        skill: s.technical_skill || s.name,
        proficiency: "Beginner",
        course: "Desired",
    }));

    return (
        <div className="bg-background pt-2 pb-4">
            <h2 className="text-base md:text-xl font-bold text-foreground text-center mb-6 tracking-tight">
                Learning Pathways
            </h2>
            <div className="flex sm:flex-wrap flex-col sm:flex-row gap-3 gap-y-3 mx-auto">
                {/* Mandatory */}
                <div className="flex-1 min-w-0 w-full bg-card rounded-xl border border-border shadow overflow-y-auto max-h-72 min-h-[200px] custom-scrollbar relative">
                    <div className="bg-[hsl(var(--chart-2))] py-1.5 px-4 rounded-t-xl font-bold text-white text-xs tracking-wide text-left sticky top-0 z-10">
                        Mandatory
                    </div>
                    <div className="px-3 py-2 pt-3">
                        {mandatorySkills.length === 0 && (
                            <div className="text-muted-foreground text-[11px]">No skills found.</div>
                        )}
                        {mandatorySkills.map((s, i) => (
                            <PathwaySkillDropdown
                                key={s.skill + i}
                                skill_set={s.skill_set}
                                skill={s.skill}
                                proficiency={s.proficiency}
                                course={"Mandatory"}
                            />
                        ))}
                    </div>
                </div>
                {/* Recommended */}
                <div className="flex-1 min-w-0 w-full bg-card rounded-xl border border-border shadow overflow-y-auto max-h-72 min-h-[200px] custom-scrollbar relative">
                    <div className="bg-[hsl(var(--chart-4))] py-1.5 px-4 rounded-t-xl font-bold text-white text-xs tracking-wide text-left sticky top-0 z-10">
                        Recommended
                    </div>
                    <div className="px-3 py-2 pt-3">
                        {recommendedSkills.length === 0 && (
                            <div className="text-muted-foreground text-[11px]">No skills found.</div>
                        )}
                        {recommendedSkills.map((s, i) => (
                            <PathwaySkillDropdown
                                key={s.skill + i}
                                skill_set={s.skill_set}
                                skill={s.skill}
                                proficiency={s.proficiency}
                                course={"Recommended"}
                            />
                        ))}
                    </div>
                </div>
                {/* Desired */}
                <div className="flex-1 min-w-0 w-full bg-card rounded-xl border border-border shadow overflow-y-auto max-h-72 min-h-[200px] custom-scrollbar relative">
                    <div className="bg-[hsl(var(--chart-5))] py-1.5 px-4 rounded-t-xl font-bold text-white text-xs tracking-wide text-left sticky top-0 z-10">
                        Desired
                    </div>
                    <div className="px-3 py-2 pt-3">
                        {desiredSkillsData.length === 0 && (
                            <div className="text-muted-foreground text-[11px]">No skills found.</div>
                        )}
                        {desiredSkillsData.map((s, i) => (
                            <PathwaySkillDropdown
                                key={s.skill + i}
                                skill_set={s.skill_set}
                                skill={s.skill}
                                proficiency={s.proficiency}
                                course={"Desired"}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}