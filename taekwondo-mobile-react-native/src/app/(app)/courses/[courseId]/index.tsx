import { useLocalSearchParams } from 'expo-router';

import { AdminCourseDetailScreen } from '@/features/course';

export default function AdminCourseDetailRoute() {
  const { courseId } = useLocalSearchParams<{ courseId?: string }>();
  return <AdminCourseDetailScreen courseId={courseId ?? 'basic'} />;
}
