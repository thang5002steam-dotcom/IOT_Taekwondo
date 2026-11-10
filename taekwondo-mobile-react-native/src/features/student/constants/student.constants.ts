export type StudentStatus = 'ACTIVE' | 'RESERVED' | 'DROPPED';

export const StudentStatusLabel: Record<StudentStatus, string> = {
  ACTIVE: 'Đang học',
  RESERVED: 'Bảo lưu',
  DROPPED: 'Nghỉ học',
};
