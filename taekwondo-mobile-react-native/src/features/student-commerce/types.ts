import type { CourseView } from "@/features/course/domain/course.types";
import type {
  Belt,
  PersonStatus,
} from "@/features/person/constants/person.constants";
import type { PositionSimpleResponse } from "@/features/position/api/position.dto";
import type { WalletTransactionDirection } from "@/features/wallet/constants/wallet.constants";

export type {
  CourseCatalogTab,
  CoursePackageView,
  CourseStaffMemberView,
  CourseView,
} from "@/features/course/domain/course.types";

export type CommerceContext = "admin-student" | "admin-course" | "account";
export type StudentCourseTab = "current" | "history";
export type TransactionFilter = "all" | "credit" | "debit";

export type StudentSummaryView = {
  personId: string;
  personCode: string;
  fullName: string;
  birthDate?: string | null;
  beltLabel: string;
  statusLabel: string;
};

export type CourseRegistrationStudentView = StudentSummaryView & {
  birthDate?: string;
  gender?: boolean | null;
  faceImagePath?: string | null;
  currentBelt?: Belt;
  status?: PersonStatus;
  position?: PositionSimpleResponse | null;
};

export type WalletSummaryView = {
  walletId: string;
  balance: number;
  currency: "VND";
};

export type WalletTransactionView = {
  id: string;
  title: string;
  direction: WalletTransactionDirection;
  amount: number;
  dateLabel: string;
  reference: string;
  courseName?: string;
};

export type CourseRegistrationCourseView = Pick<
  CourseView,
  "courseId" | "courseName" | "branchName" | "scheduleLabel" | "statusLabel"
> & { schedules: { courseScheduleId: string; label: string }[] };

export type CourseEnrollmentView = {
  enrollmentId: string;
  courseId: string;
  courseName: string;
  branchName: string;
  statusLabel: string;
  scheduleLabel: string;
  packageLabel: string;
  usedSessions: number;
  totalSessions: number;
  coachName: string;
  dateRangeLabel: string;
  tuitionFee: number;
  history?: boolean;
};

export type CourseRegistrationDraft = {
  courseId?: string;
  packageId?: string;
};

export type StudentCommerceState = {
  students: StudentSummaryView[];
  selectedStudent: StudentSummaryView;
  wallet: WalletSummaryView;
  transactions: WalletTransactionView[];
  enrollments: CourseEnrollmentView[];
  courses: CourseView[];
};

export type StudentRouteProps = {
  studentCode?: string;
};

export type EnrollmentRouteProps = StudentRouteProps & {
  enrollmentId?: string;
  context?: "admin-student" | "account";
};

export type CourseRouteProps = {
  courseId?: string;
  packageId?: string;
};

export type WalletTransactionsProps = StudentRouteProps & {
  context?: "admin-student" | "account";
  initialFilter?: TransactionFilter;
};
