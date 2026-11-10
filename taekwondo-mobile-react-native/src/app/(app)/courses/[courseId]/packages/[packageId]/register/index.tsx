import { useLocalSearchParams } from 'expo-router';

import { StudentCourseRegistrationScreen } from '@/features/student-commerce';

export default function AdminPackageRegisterRoute() {
  const { courseId, packageId } = useLocalSearchParams<{ courseId?: string; packageId?: string }>();
  return (
    <StudentCourseRegistrationScreen
      initialCourseId={courseId ?? 'basic'}
      initialPackageId={packageId ?? 'basic-1m'}
    />
  );
}
