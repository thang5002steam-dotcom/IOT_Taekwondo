export interface EnrollmentCourseScheduleSimple { courseScheduleId: string; courseId: string; startDate: string; endDate?: string | null; status: string; classSchedule?: { name?: string } }
export interface StudentEnrollmentScheduleSimpleResponse { studentEnrollmentScheduleId: string; studentEnrollmentId: string; courseSchedule: EnrollmentCourseScheduleSimple }
export interface StudentEnrollmentScheduleResponse extends StudentEnrollmentScheduleSimpleResponse { courseSchedule: EnrollmentCourseScheduleSimple }
