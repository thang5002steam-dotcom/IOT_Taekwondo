export type BookingSource = 'RECURRING' | 'MAKEUP' | 'ADMIN';
export type BookingStatus = 'RESERVED' | 'CANCELLED' | 'SETTLED';
export interface StudentSessionBooking {
  bookingId: string;
  enrollmentId: string;
  classSessionId: string;
  source: BookingSource;
  status: BookingStatus;
  bookedAt: string;
  cancelledAt: string | null;
  settledAt: string | null;
}
export interface StudentSessionOption {
  classSessionId: string;
  courseId: string;
  courseName: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  remainingCapacity: number;
  bookable: boolean;
  unavailableReason: string | null;
}
