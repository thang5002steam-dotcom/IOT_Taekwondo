import { useLocalSearchParams } from 'expo-router';
import { StudentLeaveRequestScreen } from '@/features/leave-request/screens/StudentLeaveRequestScreen';

export default function NewLeaveRequestRoute() {
  const { enrollmentId } = useLocalSearchParams<{ enrollmentId?: string }>();
  return enrollmentId ? <StudentLeaveRequestScreen enrollmentId={enrollmentId} /> : null;
}
