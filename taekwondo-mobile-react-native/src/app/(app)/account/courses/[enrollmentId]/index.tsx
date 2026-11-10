import { useLocalSearchParams } from 'expo-router';

import { CourseDetailScreen } from '@/features/course';

export default function AccountCourseDetailRoute() {
  const { enrollmentId } = useLocalSearchParams<{ enrollmentId?: string }>();
  return (
    <CourseDetailScreen
      context="account"
      studentCode="VQ_00123"
      enrollmentId={enrollmentId ?? 'basic-current'}
    />
  );
}
