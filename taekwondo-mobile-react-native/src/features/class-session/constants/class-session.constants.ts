export type SessionStatus =
  | "ACTIVE" // Đang diễn ra
  | "CANCELLED" // Đã hủy
  | "COMPLETED" // Đã hoàn thành
  | "SCHEDULED" // Đã lên lịch
  | "POSTPONED" // Đã hoãn
  | "TERMINATED"; // Đã chấm dứt / Hủy bỏ

export const SessionStatusLabel: Record<SessionStatus, string> = {
  ACTIVE: "Đang diễn ra",
  CANCELLED: "Đã hủy",
  COMPLETED: "Đã hoàn thành",
  SCHEDULED: "Đã lên lịch",
  POSTPONED: "Đã hoãn",
  TERMINATED: "Đã chấm dứt",
};

export type BookingSource = "RECURRING" | "MAKEUP" | "ADMIN";

export const BookingSourceValues = [
  "RECURRING",
  "MAKEUP",
  "ADMIN",
] as const satisfies readonly BookingSource[];

export const BookingSourceLabel: Record<BookingSource, string> = {
  RECURRING: "Đặt lịch cố định",
  MAKEUP: "Đặt lịch học bù",
  ADMIN: "Quản trị viên",
};

export type BookingStatus = "RESERVED" | "CANCELLED" | "SETTLED";

export const BookingStatusValues = [
  "RESERVED",
  "CANCELLED",
  "SETTLED",
] as const satisfies readonly BookingStatus[];

export const BookingStatusLabel: Record<BookingStatus, string> = {
  RESERVED: "Đã đặt",
  CANCELLED: "Đã hủy",
  SETTLED: "Đã chốt",
};
