import type { SessionResponse, SessionSimpleResponse } from '@/features/class-session/api/class-session.dto';
import type { PersonResponse, PersonSimpleResponse } from '@/features/person/api/person.dto';
import type { UserSimpleResponse } from '@/features/user/api/user.dto';
import type { LeaveRequestStatus, RequesterType } from '../constants/leave-request.constants';

export interface LeaveRequestCreateRequest {
  personId: string;
  requesterType: RequesterType;
  leaveDate?: string | null;
  leaveClassSessionId?: string | null;
  makeupClassSessionId?: string | null;
  leaveContext: string;
}

export interface StudentLeaveRequestCreateRequest {
  leaveBookingId: string;
  makeupClassSessionId: string;
  leaveContext: string;
}

export interface LeaveRequestReviewCommand {
  reviewNote?: string | null;
}

export interface LeaveRequestResponse {
  leaveRequestId: string;
  person: PersonResponse;
  requesterType: RequesterType;
  leaveDate: string | null;
  leaveClassSession: SessionResponse | null;
  makeupClassSession: SessionResponse | null;
  leaveContext: string | null;
  status: LeaveRequestStatus;
  createdByUser: UserSimpleResponse | null;
  reviewedByUser: UserSimpleResponse | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequestSimpleResponse {
  leaveRequestId: string;
  person: PersonSimpleResponse;
  requesterType: RequesterType;
  leaveDate: string | null;
  leaveClassSession: SessionSimpleResponse | null;
  makeupClassSession: SessionSimpleResponse | null;
  status: LeaveRequestStatus;
  reviewedAt: string | null;
}

export interface LeaveRequestListParams {
  page?: number;
  size?: number;
  sort?: string | string[];
}
