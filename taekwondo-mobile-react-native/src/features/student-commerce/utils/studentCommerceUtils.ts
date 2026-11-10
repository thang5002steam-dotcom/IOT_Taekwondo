import type { Href } from 'expo-router';

import { studentCommerceMock } from '../fixtures/studentCommerce.fixtures';
import type {
  CourseCatalogTab,
  CoursePackageView,
  CourseRegistrationDraft,
  CourseView,
  TransactionFilter,
  WalletSummaryView,
  WalletTransactionView,
} from '../types';

export function asHref(path: string) {
  return path as Href;
}

export function getCommerceState() {
  return studentCommerceMock;
}

export function defaultPackageId(courseId: string) {
  return `${courseId}-3m`;
}

export function getEnrollment(enrollmentId?: string) {
  const state = getCommerceState();
  return (
    state.enrollments.find((item) => item.enrollmentId === enrollmentId) ??
    state.enrollments[0]
  );
}

export function formatVnd(amount: number) {
  return `${new Intl.NumberFormat('vi-VN').format(amount)}đ`;
}

function getPackageDurationMonths(coursePackage: CoursePackageView) {
  const durationMatch = coursePackage.durationLabel.match(/\d+/);
  return durationMatch ? Math.max(Number(durationMatch[0]), 1) : 1;
}

export function getMonthlyPackagePrice(coursePackage: CoursePackageView) {
  return Math.round(coursePackage.amount / getPackageDurationMonths(coursePackage));
}

export function getCourseStartingMonthlyPrice(course: CourseView) {
  if (course.packages.length === 0) return undefined;
  return Math.min(...course.packages.map(getMonthlyPackagePrice));
}

export function formatCourseStartingPrice(course: CourseView) {
  const amount = getCourseStartingMonthlyPrice(course);
  return amount ? `Từ ${formatVnd(amount)}/tháng` : 'Chưa có học phí';
}

export function filterTransactions(
  transactions: WalletTransactionView[],
  filter: TransactionFilter,
) {
  if (filter === 'credit') return transactions.filter((item) => item.direction === 'CREDIT');
  if (filter === 'debit') return transactions.filter((item) => item.direction === 'DEBIT');
  return transactions;
}

export function calculateBalanceAfterTopUp(wallet: WalletSummaryView, amount: number) {
  return wallet.balance + amount;
}

export function filterCoursesByCatalogTab(courses: CourseView[], tab: CourseCatalogTab) {
  return courses.filter((course) => course.catalogStatus === tab);
}

export function getCourse(courses: CourseView[], courseId?: string) {
  return courses.find((course) => course.courseId === courseId) ?? courses[0];
}

export function getPackage(course: CourseView | undefined, packageId?: string) {
  if (!course) return undefined;
  return course.packages.find((item) => item.id === packageId) ?? course.packages[0];
}

export function canConfirmCourseRegistration(
  courseId?: string,
  packageId?: string,
) {
  return Boolean(courseId && packageId);
}

export function getRegistrationSummary(
  wallet: WalletSummaryView,
  course: CourseView | undefined,
  coursePackage: CoursePackageView | undefined,
) {
  return {
    courseName: course?.courseName ?? '',
    packageLabel: coursePackage?.label ?? '',
    price: coursePackage?.amount ?? 0,
    balanceAfter: wallet.balance - (coursePackage?.amount ?? 0),
  };
}

export function getSelectedCourse(courses: CourseView[], courseId?: string) {
  return courses.find((course) => course.courseId === courseId);
}

export function getSelectedPrice(courses: CourseView[], courseId?: string, packageId?: string) {
  return getPackage(getSelectedCourse(courses, courseId), packageId);
}

export function draftFromCoursePackage(courseId?: string, packageId?: string): CourseRegistrationDraft {
  return { courseId, packageId };
}
