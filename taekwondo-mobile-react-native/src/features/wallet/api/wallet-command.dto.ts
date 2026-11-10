import type {
  WalletTransactionDirection,
  WalletTransactionStatus,
  WalletTransactionType,
} from '../constants/wallet.constants';

export interface WalletCoursePurchaseRequest {
  studentPersonId: string;
  coursePriceId: string;
  courseScheduleIds: string[];
  externalReference: string;
  note?: string | null;
}

export interface WalletRecurringScheduleSelection {
  requirementId: string;
  courseScheduleId: string;
}

export interface WalletTrainingPlanPurchaseRequest {
  studentPersonId: string;
  trainingPlanId: string;
  startDate: string;
  recurringSchedules: WalletRecurringScheduleSelection[];
  externalReference: string;
  note?: string | null;
}

export interface WalletRefundRequest {
  originalDebitTransactionId: string;
  note?: string | null;
}

export interface WalletCommandTransactionResponse {
  walletTransactionId: string;
  walletId: string;
  type: WalletTransactionType;
  direction: WalletTransactionDirection;
  status: WalletTransactionStatus;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  externalReference: string;
  coursePurchaseId: string | null;
  studentEnrollmentId: string | null;
  reviewedAt: string | null;
}
