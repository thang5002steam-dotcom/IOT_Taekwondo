import { javaApi } from '@/infrastructure/http/httpClient';
import type { PageResponse } from '@/infrastructure/http/pagination.types';
import type { EnrollmentAddonPurchaseListParams, EnrollmentAddonPurchaseResponse, EnrollmentAddonPurchaseSimpleResponse } from './enrollmentAddonPurchase.dto';
export const enrollmentAddonPurchaseApi = { async list(params?: EnrollmentAddonPurchaseListParams): Promise<PageResponse<EnrollmentAddonPurchaseSimpleResponse>> { return (await javaApi.get<PageResponse<EnrollmentAddonPurchaseSimpleResponse>>('/enrollment-addon-purchases', { params })).data; }, async get(id: string): Promise<EnrollmentAddonPurchaseResponse> { return (await javaApi.get<EnrollmentAddonPurchaseResponse>(`/enrollment-addon-purchases/${id}`)).data; } };
