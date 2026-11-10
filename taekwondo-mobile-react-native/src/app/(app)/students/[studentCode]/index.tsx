import { useLocalSearchParams } from 'expo-router';

import { StudentDetailScreen } from '@/features/student';

export default function StudentDetailRoute() {
  const { studentCode } = useLocalSearchParams<{ studentCode?: string }>();
  return <StudentDetailScreen studentCode={studentCode} />;
}
