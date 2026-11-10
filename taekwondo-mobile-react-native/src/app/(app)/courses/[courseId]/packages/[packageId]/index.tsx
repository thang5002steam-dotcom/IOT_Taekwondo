import { useLocalSearchParams } from 'expo-router';

import { PackageDetailScreen } from '@/features/course';

export default function AdminPackageDetailRoute() {
  const { courseId, packageId } = useLocalSearchParams<{ courseId?: string; packageId?: string }>();
  return <PackageDetailScreen courseId={courseId ?? 'basic'} packageId={packageId ?? 'basic-1m'} />;
}
