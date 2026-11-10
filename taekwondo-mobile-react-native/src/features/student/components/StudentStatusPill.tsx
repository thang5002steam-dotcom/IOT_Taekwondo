import { StatusBadge } from "@/shared/ui/StatusBadge";

export function StudentStatusPill({ label }: { label: string }) {
  const paused = label === "Bảo lưu";

  return <StatusBadge label={label} tone={paused ? "neutral" : "primary"} />;
}
