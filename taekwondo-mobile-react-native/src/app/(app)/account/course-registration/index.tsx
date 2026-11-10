import { useLocalSearchParams } from 'expo-router';

import { StudentCourseRegistrationScreen } from '@/features/student-commerce';

export default function AccountCourseRegistrationRoute() {
  const { courseId, packageId } = useLocalSearchParams<{ courseId?: string; packageId?: string }>();
  return (
    <StudentCourseRegistrationScreen
      studentCode="VQ_00123"
      initialCourseId={courseId}
      initialPackageId={packageId}
    />
  );
}
