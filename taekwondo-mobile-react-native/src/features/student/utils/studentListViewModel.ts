import type { StudentSummaryView } from "@/features/student-commerce/types";

export type StudentListTab = "all" | "learning" | "paused";

export const STUDENT_TABS = [
  { value: "all", label: "Tất cả" },
  { value: "learning", label: "Đang học" },
  { value: "paused", label: "Bảo lưu" },
] as const;

export function isPausedStudent(student: StudentSummaryView) {
  return student.statusLabel === "Bảo lưu";
}

export function filterStudentsByTab(
  students: StudentSummaryView[],
  tab: StudentListTab,
) {
  if (tab === "all") return students;
  return students.filter((student) =>
    tab === "paused" ? isPausedStudent(student) : !isPausedStudent(student),
  );
}

export function getStudentInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
