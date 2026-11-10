export type SkillLevel = "BASIC" | "ADVANCED" | "EXPERT";

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  BASIC: "Cơ bản",
  ADVANCED: "Nâng cao",
  EXPERT: "Chuyên sâu",
};

export const SKILL_LEVEL_OPTIONS: SkillLevel[] = [
  "BASIC",
  "ADVANCED",
  "EXPERT",
];
