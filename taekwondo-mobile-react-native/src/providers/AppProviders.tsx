import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type PropsWithChildren } from 'react';

import { useAuthenticationRuntime } from '@/features/authentication';
import { initializeDatabase } from '@/infrastructure/database/database';
import { useMqttRuntime } from '@/infrastructure/mqtt';
import { queryClient } from '@/infrastructure/query/queryClient';
import { ToastProvider } from '@/shared/ui/Toast';
import { OrientationRuntime } from './OrientationRuntime';

function DatabaseRuntime({ children }: PropsWithChildren) {
  useEffect(() => {
    void initializeDatabase().catch((error: unknown) => {
      console.error('[Database] initialize failed', error);
    });
  }, []);

  return children;
}

function AuthRuntime({ children }: PropsWithChildren) {
  useAuthenticationRuntime();
  useMqttRuntime();
  return children;
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <OrientationRuntime>
        <DatabaseRuntime>
          <AuthRuntime>
            <ToastProvider>{children}</ToastProvider>
          </AuthRuntime>
        </DatabaseRuntime>
      </OrientationRuntime>
    </QueryClientProvider>
  );
}
