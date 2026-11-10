import { useEffect } from 'react';
import { useRouter } from 'expo-router';

/** Route /admin/training-plans/create redirects back to management screen where sheet opens natively. */
export function CreateTrainingPlanScreen() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/training-plans' as never);
  }, [router]);
  return null;
}
