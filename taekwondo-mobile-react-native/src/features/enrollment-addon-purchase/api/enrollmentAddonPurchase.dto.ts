export interface EnrollmentAddonPurchaseSimpleResponse { enrollmentAddonPurchaseId: string; studentEnrollmentId: string; trainingPlanAddonId: string; effectiveWeekStart: string; effectiveTo: string; grantedSessionCount: number; createdAt: string }
export interface EnrollmentAddonPurchaseResponse extends EnrollmentAddonPurchaseSimpleResponse { walletTransactionId: string }
export interface EnrollmentAddonPurchaseListParams { page?: number; size?: number; sort?: string | string[]; studentEnrollmentId?: string; trainingPlanAddonId?: string }
