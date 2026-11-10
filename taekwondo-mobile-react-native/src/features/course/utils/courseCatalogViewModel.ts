import type { CourseCatalogTab, CourseView } from "../domain/course.types";
import { filterCoursesByCatalogTab } from "@/features/student-commerce/utils/studentCommerceUtils";

export const COURSE_CATALOG_TABS: { value: CourseCatalogTab; label: string }[] =
  [
    { value: "registration", label: "Dự kiến" },
    { value: "active", label: "Đang mở" },
    { value: "ended", label: "Đã kết thúc" },
  ];

export function getCourseSearchPlaceholder(tab: CourseCatalogTab) {
  return tab === "registration"
    ? "Tên khóa học, cơ sở..."
    : "Tên khóa học, HLV...";
}

export function getCoursesForCatalogTab(
  courses: CourseView[],
  tab: CourseCatalogTab,
) {
  return filterCoursesByCatalogTab(courses, tab);
}
