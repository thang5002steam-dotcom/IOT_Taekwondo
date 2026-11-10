import { ScheduleDetailSheet } from "@/features/class-schedule/components/ScheduleDetailSheet";
import { WeekdayCodeToLabel, WeekdayLabel, type Weekday } from "@/features/class-schedule/constants/class-schedule.constants";
import type { CourseScheduleView } from "@/features/course/domain/course.types";

type Props = {
  schedule?: CourseScheduleView;
  onClose: () => void;
  onEdit?: (schedule: CourseScheduleView) => void;
  onToggleStatus?: (schedule: CourseScheduleView) => void;
  onDelete?: (schedule: CourseScheduleView) => Promise<boolean>;
  onCancelDelete?: () => void;
  deleting?: boolean;
  actionPending?: boolean;
};

export function CourseScheduleDetailWindow({ schedule, onClose, onEdit, onToggleStatus, onDelete, onCancelDelete, deleting, actionPending }: Props) {
  const actions = schedule && (onEdit || onToggleStatus || onDelete) ? {
    disabled: actionPending,
    loading: actionPending,
    deleting,
    onEdit: onEdit ? () => { const target = schedule; onClose(); onEdit(target); } : undefined,
    onToggleStatus: onToggleStatus ? () => onToggleStatus(schedule) : undefined,
    onDelete: onDelete ? () => onDelete(schedule) : undefined,
    onCancelDelete,
  } : undefined;
  const weekdayLabel = schedule ? typeof schedule.weekday === "number"
    ? WeekdayCodeToLabel[schedule.weekday] ?? `Thứ ${schedule.weekday}`
    : schedule.weekday ? WeekdayLabel[schedule.weekday as Weekday] ?? String(schedule.weekday) : "Lịch học" : "";
  return <ScheduleDetailSheet
    visible={Boolean(schedule)}
    onClose={onClose}
    actions={actions}
    schedule={schedule ? {
      id: schedule.courseScheduleId,
      weekdayLabel,
      timeLabel: schedule.startTime && schedule.endTime ? `${schedule.startTime.slice(0, 5)} - ${schedule.endTime.slice(0, 5)}` : "",
      branchName: schedule.branchName,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      statusLabel: schedule.status === "ACTIVE" ? "Đang hoạt động" : "Đã tạm dừng",
      staff: schedule.staffAssignments.map((staff) => ({ id: staff.assignmentId, fullName: staff.fullName, roleLabel: staff.roleLabel, isPrimary: staff.isPrimary })),
    } : undefined}
  />;
}
