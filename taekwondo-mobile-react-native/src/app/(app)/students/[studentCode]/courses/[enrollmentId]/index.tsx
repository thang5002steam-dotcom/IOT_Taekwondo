import { useLocalSearchParams } from 'expo-router';

import { CourseDetailScreen } from '@/features/course';

export default function StudentCourseDetailRoute() {
  const { studentCode, enrollmentId } = useLocalSearchParams<{
    studentCode?: string;
    enrollmentId?: string;
  }>();
  return (
    <CourseDetailScreen
      context="admin-student"
      studentCode={studentCode ?? 'VQ_00123'}
      enrollmentId={enrollmentId ?? 'basic-current'}
    />
  );
}
