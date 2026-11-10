import type { StudentSummary } from '@/features/student/api/student-summary.dto';

export interface ProcessPaymentRequest {
  studentId: string;
  enrollmentId: string;
  numberOfMonths: number;
  note?: string;
}

export interface TuitionPaymentDetailResponse {
  detailId: string;
  enrollmentId: string;
  scheduleId: string;
  forMonth: number;
  forYear: number;
  amountAllocated: number;
}

export interface TuitionPaymentResponse {
  paymentId: string;
  student: StudentSummary;
  totalAmount: number;
  note: string | null;
  createdAt: string;
  details: TuitionPaymentDetailResponse[];
}
export interface ActiveClassStatus {
  enrollmentId: string;
  scheduleId: string;
  paid: boolean;
  amountAllocated: number | null;
}

export interface TuitionStatusResponse {
  studentId: string;
  studentCode: string;
  fullName: string;
  hasPaidCurrentMonth: boolean;
  currentMonth: number;
  currentYear: number;
  activeClasses: ActiveClassStatus[];
}

export interface PaymentHistoryItem {
  forMonth: number;
  forYear: number;
  amountAllocated: number;
  className: string;
  paidAt: string;
}

export interface TuitionPaymentListParams {
  search?: string;
  page?: number;
  size?: number;
  sort?: string | string[];
}
