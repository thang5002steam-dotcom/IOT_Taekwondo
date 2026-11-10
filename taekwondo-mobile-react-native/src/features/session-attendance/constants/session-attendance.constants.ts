export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "EXCUSED"
  | "MAKEUP";

export const AttendanceStatusLabel: Record<AttendanceStatus, string> = {
  PRESENT: "Có mặt",
  ABSENT: "Vắng mặt",
  LATE: "Đi muộn",
  EXCUSED: "Vắng có phép",
  MAKEUP: "Học bù",
};

export const AttendanceStatusValues = [
  "PRESENT",
  "ABSENT",
  "EXCUSED",
  "MAKEUP",
  "LATE",
] as const satisfies readonly AttendanceStatus[];

export type BeltPromotionStatus = "PASSED" | "FAILED" | "PENDING";

export const BeltPromotionStatusValues = [
  "PASSED",
  "FAILED",
  "PENDING",
] as const satisfies readonly BeltPromotionStatus[];

export const BeltPromotionStatusLabel: Record<BeltPromotionStatus, string> = {
  PASSED: "Đạt",
  FAILED: "Không đạt",
  PENDING: "Chờ xét",
};

export type EvaluationStatus =
  | "PENDING" // Chờ đánh giá  → "P"
  | "GOOD" // Tốt            → "T"
  | "AVERAGE" // Trung bình     → "TB"
  | "WEAK"; // Yếu            → "Y"

/** Giá trị rút gọn dùng khi serialize ra JSON (tương đương @JsonValue bên Java) */
export const EvaluationStatusValue: Record<EvaluationStatus, string> = {
  PENDING: "P",
  GOOD: "T",
  AVERAGE: "TB",
  WEAK: "Y",
};

/** Tra cứu EvaluationStatus từ giá trị rút gọn (tương đương fromValue() bên Java) */
export const EvaluationStatusFromValue = Object.entries(
  EvaluationStatusValue,
).reduce(
  (acc, [key, val]) => {
    acc[val] = key as EvaluationStatus;
    return acc;
  },
  {} as Record<string, EvaluationStatus>,
);

export const EvaluationStatusLabel: Record<EvaluationStatus, string> = {
  PENDING: "Chờ đánh giá",
  GOOD: "Tốt",
  AVERAGE: "Trung bình",
  WEAK: "Yếu",
};

