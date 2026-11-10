import { javaApi } from '@/infrastructure/http/httpClient';
import type { PageResponse } from '@/infrastructure/http/pagination.types';

import type {
  PaymentHistoryItem,
  ProcessPaymentRequest,
  TuitionPaymentListParams,
  TuitionPaymentResponse,
  TuitionStatusResponse,
} from './tuition-payment.dto';

export const tuitionPaymentApi = {
  async process(request: ProcessPaymentRequest): Promise<TuitionPaymentResponse> {
    const response = await javaApi.post<TuitionPaymentResponse>('/tuition-payments', request);
    return response.data;
  },
  async getStatus(studentId: string): Promise<TuitionStatusResponse> {
    const response = await javaApi.get<TuitionStatusResponse>(`/tuition-payments/status/${studentId}`);
    return response.data;
  },
  async getHistory(studentId: string): Promise<PaymentHistoryItem[]> {
    const response = await javaApi.get<PaymentHistoryItem[]>(`/tuition-payments/history/${studentId}`);
    return response.data;
  },
  async getHistoryByEnrollment(enrollmentId: string): Promise<PaymentHistoryItem[]> {
    const response = await javaApi.get<PaymentHistoryItem[]>(`/tuition-payments/history/enrollment/${enrollmentId}`);
    return response.data;
  },
  async getList(params?: TuitionPaymentListParams): Promise<PageResponse<TuitionPaymentResponse>> {
    const response = await javaApi.get<PageResponse<TuitionPaymentResponse>>('/tuition-payments', { params });
    return response.data;
  },
};
