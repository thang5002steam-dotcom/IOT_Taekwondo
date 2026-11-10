import { useLocalSearchParams } from 'expo-router';

import { StudentCourseRegistrationScreen } from '@/features/student-commerce';

export default function StudentCourseRegistrationRoute() {
  const { studentCode, courseId, packageId } = useLocalSearchParams<{
    studentCode?: string;
    courseId?: string;
    packageId?: string;
  }>();
  return (
    <StudentCourseRegistrationScreen
      studentCode={studentCode ?? 'VQ_00123'}
      initialCourseId={courseId}
      initialPackageId={packageId}
    />
  );
}
