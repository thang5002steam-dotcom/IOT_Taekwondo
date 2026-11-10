import { Redirect, useLocalSearchParams } from "expo-router";

import { CoursePriceListScreen } from "@/features/course-price";

export default function CoursePackageListRoute() {
  const params = useLocalSearchParams<{ courseId?: string }>();
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId;
  return courseId ? <CoursePriceListScreen courseId={courseId} /> : <Redirect href="/courses" />;
}
