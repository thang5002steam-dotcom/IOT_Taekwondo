export interface AttendanceStats {
  totalRecords: number;
  attendanceRate: number;
  presentCount: number;
  absentCount: number;
  excusedCount: number;
  makeupCount: number;
  lateCount: number;
  evalGoodCount: number;
  evalAverageCount: number;
  evalWeakCount: number;
  evalPendingCount: number;
}
