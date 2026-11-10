import { javaApi } from '@/infrastructure/http/httpClient';
import type { StudentSessionBooking, StudentSessionOption } from './student-session-booking.dto';

export const studentSessionBookingApi = {
  async list(enrollmentId: string): Promise<StudentSessionBooking[]> {
    return (await javaApi.get<StudentSessionBooking[]>(`/student-enrollments/${enrollmentId}/bookings`)).data;
  },
  async leaveOptions(enrollmentId: string): Promise<StudentSessionBooking[]> {
    return (await javaApi.get<StudentSessionBooking[]>(`/student-enrollments/${enrollmentId}/bookings/leave-options`)).data;
  },
  async makeupOptions(enrollmentId: string, leaveBookingId: string): Promise<StudentSessionOption[]> {
    return (await javaApi.get<StudentSessionOption[]>(`/student-enrollments/${enrollmentId}/bookings/makeup-options`, { params: { leaveBookingId } })).data;
  },
  async cancel(enrollmentId: string, bookingId: string): Promise<void> {
    await javaApi.delete(`/student-enrollments/${enrollmentId}/bookings/${bookingId}`);
  },
};
