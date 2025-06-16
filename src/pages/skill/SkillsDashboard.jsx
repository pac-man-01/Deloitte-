import React, { useEffect, useState } from "react";
import { Circle, Star } from "lucide-react";
import { SkillCard } from "./SkillCard";
import { SecondarySkillCard } from "./SecondarySkillCard";
import { useFetchSkillsMutation } from "@/redux/services/serviceApi";
import { DesiredSkillCard } from "./DesiredSkillCard";
import { Section } from "./Section";
import { useAuth } from "@/context/AuthContext";
import { getBaseURL } from "@/utils/getBaseURL";
import Pathways from "./Pathways";

// --- API helpers for desired skills ---
// const getBaseURL() = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"; // e.g. "http://localhost:8000"

async function fetchDesiredSkills(userEmail) {
  const res = await fetch(`${getBaseURL()}/desired-skills/${userEmail}`);
  if (!res.ok) throw new Error("Failed to fetch desired skills");
  return res.json();
}

async function addDesiredSkill(skill) {
  const res = await fetch(`${getBaseURL()}/desired-skills/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(skill),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to add desired skill");
  }
  return res.json();
}

async function removeDesiredSkill(skill) {
  const res = await fetch(`${getBaseURL()}/desired-skills/`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_email: skill.user_email,
      skill_set: skill.skill_set,
      technical_skill: skill.technical_skill,
    }),
  });
  if (!res.ok) {
    let msg = "Failed to remove desired skill";
    try {
      const error = await res.json();
      msg = error.detail || msg;
    } catch (e) { }
    throw new Error(msg);
  }
}

// --- Main SkillsDashboard component ---
const SkillsDashboard = () => {
  const { currentUser } = useAuth();
  const [userEmail] = useState(currentUser.email);
  // console.log("currentUser:", currentUser);
  // console.log("userEmail:", userEmail);
  const [fetchSkills, { data: employeeData, error, isLoading }] =
    useFetchSkillsMutation();

  // Local state for desired and aspirational skills
  const [desiredSkills, setDesiredSkills] = useState([]);
  const [localAspirational, setLocalAspirational] = useState([]);
  const [loadingDesired, setLoadingDesired] = useState(false);
  const [desiredError, setDesiredError] = useState(null);

  // Fetch all skills (backend call)
  useEffect(() => {
    if (userEmail) fetchSkills(userEmail);
  }, [userEmail, fetchSkills]);

  // Fetch desired skills from backend
  useEffect(() => {
    if (!userEmail) return;
    setLoadingDesired(true);
    fetchDesiredSkills(userEmail)
      .then((skills) => setDesiredSkills(skills))
      .catch((e) => setDesiredError(e.message))
      .finally(() => setLoadingDesired(false));
  }, [userEmail]);

  // When employeeData loads, set aspirational skills (reset array)
  useEffect(() => {
    if (employeeData) {
      // Prepare set of desired skills for exclusion
      const desiredPairs = new Set(
        desiredSkills.map(
          (s) => `${s.skill_set?.toLowerCase() || ""}|${s.technical_skill?.toLowerCase() || ""}`
        )
      );

      const aspirationalSkills = (employeeData.aspirationalskill || [])
        .filter(
          (skill) =>
            !desiredPairs.has(
              `${(skill.skill_set || "").toLowerCase()}|${(skill.technical_skill || "").toLowerCase()}`
            )
        )
        .map((skill) => ({
          category: skill.skill_set,
          name: skill.technical_skill,
          level: "Beginner",
          status: "available",
        }));

      setLocalAspirational(aspirationalSkills);
    }
  }, [employeeData, desiredSkills]);

  // Move to desired handler (with backend integration)
  const handleMoveToDesired = async (skill) => {
    if (!userEmail) return;
    const newSkill = {
      user_email: userEmail,
      skill_set: skill.category,
      technical_skill: skill.name,
    };
    setLoadingDesired(true);
    try {
      await addDesiredSkill(newSkill);
      setDesiredSkills((prev) => {
        if (
          prev.some(
            (s) =>
              s.skill_set === skill.category && s.technical_skill === skill.name
          )
        ) {
          return prev;
        }
        return [...prev, newSkill];
      });
      setLocalAspirational((prev) =>
        prev.filter(
          (s) => !(s.category === skill.category && s.name === skill.name)
        )
      );
      setDesiredError(null);
    } catch (e) {
      setDesiredError(e.message);
    } finally {
      setLoadingDesired(false);
    }
  };

  // Remove from desired handler (with backend integration)
  const handleRemoveFromDesired = async (skill) => {
    if (!userEmail) return;
    const removeSkill = {
      user_email: userEmail,
      skill_set: skill.category,
      technical_skill: skill.name,
    };
    setLoadingDesired(true);
    try {
      await removeDesiredSkill(removeSkill);
      setDesiredSkills((prev) =>
        prev.filter(
          (s) =>
            !(
              s.skill_set === skill.category && s.technical_skill === skill.name
            )
        )
      );
      setLocalAspirational((prev) => [
        ...prev,
        { ...skill, level: "Beginner" },
      ]);
      setDesiredError(null);
    } catch (e) {
      setDesiredError(e.message);
    } finally {
      setLoadingDesired(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent border-t-transparent"></div>
        <p className="mt-6 text-lg text-muted-foreground">
          Loading skills, please wait...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        Failed to load skills.
      </div>
    );
  }

  if (!employeeData) {
    return <div className="text-center py-8">No data available.</div>;
  }

  // Mandatory skills (primary & secondary from backend)
  const primaryMandatorySkills = (employeeData.primaryskill || []).map(
    (skill) => ({
      ...skill,
      category: skill.skill_set || "N/A",
      name: skill.name,
      level: skill.proficiency || "Expert",
    })
  );

  const secondaryMandatorySkills = (employeeData.secondaryskill || []).map(
    (skill) => ({
      ...skill,
      category: skill.skill_set || "N/A",
      name: skill.name,
      level: skill.proficiency || "Intermediate",
    })
  );

  // Recommended skills from backend
  const recommendedSkills = (employeeData.recommendedskill || []).map(
    (skill) => ({
      category: skill.skill_set,
      name: skill.technical_skill,
      level: "Beginner",
      status: "available",
    })
  );

  // Helper: Map backend desired skills to display format
  const desiredSkillsDisplay = desiredSkills.map((skill) => ({
    category: skill.skill_set,
    name: skill.technical_skill,
    level: "Beginner",
  }));

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          {/* MANDATORY & RECOMMENDED side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* MANDATORY */}
            <Section title="Mandatory Skills" className="bg-secondary/30">
              {/* Primary Skill sub-segment */}
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-2">Primary Skill</h3>
                {primaryMandatorySkills.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {primaryMandatorySkills.map((skill, idx) => (
                      <SkillCard
                        key={idx}
                        skill={{
                          ...skill,
                          category: skill.category || "",
                          name: skill.name,
                          level: skill.proficiency || "Expert",
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    <Circle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p>No data available</p>
                  </div>
                )}
              </div>
              {/* Secondary Skill sub-segment */}
              <div>
                <h3 className="text-md font-semibold mb-2">Secondary Skill</h3>
                {secondaryMandatorySkills.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {secondaryMandatorySkills.map((skill, idx) => (
                      <SkillCard
                        key={idx}
                        skill={{
                          ...skill,
                          category: skill.category || "",
                          name: skill.name,
                          level: skill.proficiency || "Intermediate",
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    <Circle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p>No data available</p>
                  </div>
                )}
              </div>
            </Section>
            {/* RECOMMENDED */}
            <Section title="Recommended Skills" className="bg-accent/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendedSkills.length > 0 ? (
                  recommendedSkills.map((skill, index) => (
                    <SkillCard key={index} skill={skill} />
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Circle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p>No recommended skills identified</p>
                  </div>
                )}
              </div>
            </Section>
          </div>

          {/* DESIRED */}
          <Section title="Desired Skills">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingDesired && (
                <div className="flex flex-col items-center py-8 w-full col-span-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent"></div>
                  <p className="text-muted-foreground mt-3">
                    Updating desired skills...
                  </p>
                </div>
              )}
              {desiredError && (
                <div className="text-red-500 text-center py-2 w-full col-span-full">
                  {desiredError}
                </div>
              )}
              {!loadingDesired && desiredSkillsDisplay.length > 0
                ? desiredSkillsDisplay.map((skill, index) => (
                  <DesiredSkillCard
                    key={index}
                    skill={skill}
                    onRemove={handleRemoveFromDesired}
                  />
                ))
                : !loadingDesired && (
                  <div className="flex flex-col items-center justify-center min-h-[200px]">
                    <Star className="w-12 h-12 mx-auto mb-3 text-green-400" />
                    <p className="text-center">No desired skills selected</p>
                  </div>
                )}
            </div>
          </Section>

          {/* ASPIRATIONAL: full width at bottom */}
          <Section title="Aspirational Skills">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {localAspirational.length > 0 ? (
                localAspirational.map((skill, index) => (
                  <SecondarySkillCard
                    key={index}
                    skill={skill}
                    onMoveToDesired={handleMoveToDesired}
                  />
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Circle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p>No aspirational skills identified</p>
                </div>
              )}
            </div>
          </Section>

          <Pathways skills={employeeData} desiredSkills={desiredSkills} />
        </div>
      </div>
    </div>
  );
};

export default SkillsDashboard;
