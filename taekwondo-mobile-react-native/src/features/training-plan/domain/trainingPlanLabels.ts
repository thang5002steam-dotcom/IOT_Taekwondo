export function levelLabel(level: string): string {
  return (
    {
      BASIC: "Cơ bản",
      ADVANCED: "Nâng cao",
      EXPERT: "Chuyên sâu",
    }[level] ?? level
  );
}
