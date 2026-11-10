import { Redirect, useLocalSearchParams } from "expo-router";

import { CourseScheduleListScreen } from "@/features/course/screens/CourseScheduleListScreen";

export default function CourseScheduleListRoute() {
  const params = useLocalSearchParams<{ courseId?: string }>();
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId;
  return courseId ? <CourseScheduleListScreen courseId={courseId} /> : <Redirect href="/courses" />;
}
