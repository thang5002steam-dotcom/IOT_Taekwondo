import { Redirect, useLocalSearchParams } from "expo-router";

import {
  CourseMemberRosterScreen,
  isCourseMemberKind,
} from "@/features/course-member-roster";

export default function CourseMemberRosterRoute() {
  const params = useLocalSearchParams<{ courseId?: string; memberKind?: string }>();
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId;
  const memberKind = Array.isArray(params.memberKind) ? params.memberKind[0] : params.memberKind;

  if (!courseId || !memberKind || !isCourseMemberKind(memberKind)) {
    return <Redirect href="/courses" />;
  }

  return <CourseMemberRosterScreen courseId={courseId} memberKind={memberKind} />;
}
