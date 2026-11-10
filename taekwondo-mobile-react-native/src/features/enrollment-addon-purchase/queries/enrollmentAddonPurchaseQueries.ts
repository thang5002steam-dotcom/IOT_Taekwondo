import { useQuery } from '@tanstack/react-query';
import { enrollmentAddonPurchaseApi } from '../api/enrollmentAddonPurchaseApi';
import type { EnrollmentAddonPurchaseListParams } from '../api/enrollmentAddonPurchase.dto';
export const enrollmentAddonPurchaseKeys = { all: ['enrollment-addon-purchases'] as const, list: (params?: EnrollmentAddonPurchaseListParams) => [...enrollmentAddonPurchaseKeys.all, 'list', params] as const, detail: (id?: string) => [...enrollmentAddonPurchaseKeys.all, 'detail', id ?? ''] as const };
export function useEnrollmentAddonPurchases(params: EnrollmentAddonPurchaseListParams = {}) { return useQuery({ queryKey: enrollmentAddonPurchaseKeys.list(params), queryFn: () => enrollmentAddonPurchaseApi.list(params), staleTime: 30_000 }); }
export function useEnrollmentAddonPurchase(id?: string) { return useQuery({ queryKey: enrollmentAddonPurchaseKeys.detail(id), queryFn: () => enrollmentAddonPurchaseApi.get(id!), enabled: Boolean(id), staleTime: 30_000 }); }
