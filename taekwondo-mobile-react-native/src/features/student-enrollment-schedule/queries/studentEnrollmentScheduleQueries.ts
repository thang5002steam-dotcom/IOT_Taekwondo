import { useQuery } from '@tanstack/react-query';
import { studentEnrollmentScheduleApi } from '../api/studentEnrollmentScheduleApi';
export const studentEnrollmentScheduleKeys={all:['student-enrollment-schedules'] as const,list:(id?:string)=>[...studentEnrollmentScheduleKeys.all,'list',id??''] as const,detail:(id?:string)=>[...studentEnrollmentScheduleKeys.all,'detail',id??''] as const};
export function useStudentEnrollmentSchedules(enrollmentId?:string){return useQuery({queryKey:studentEnrollmentScheduleKeys.list(enrollmentId),queryFn:()=>studentEnrollmentScheduleApi.list(enrollmentId!),enabled:Boolean(enrollmentId),staleTime:30_000});}
export function useStudentEnrollmentSchedule(id?:string){return useQuery({queryKey:studentEnrollmentScheduleKeys.detail(id),queryFn:()=>studentEnrollmentScheduleApi.get(id!),enabled:Boolean(id),staleTime:30_000});}
