import { useLocalSearchParams } from 'expo-router';

import { StudentCourseRegistrationScreen } from '@/features/student-commerce';

export default function AdminCourseRegisterRoute() {
  const { courseId, packageId } = useLocalSearchParams<{ courseId?: string; packageId?: string }>();
  return (
    <StudentCourseRegistrationScreen
      initialCourseId={courseId ?? 'basic'}
      initialPackageId={packageId}
    />
  );
}
