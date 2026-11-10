import { useEffect } from 'react';

import { env } from '@/config/env';
import { useAuthStore } from '@/features/authentication/store/auth.store';

import { mqttClient } from './mqttClient';

export function useMqttRuntime(): void {
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (status !== 'authenticated') {
      mqttClient.disconnect();
      return undefined;
    }

    if (!env.mqttEnabled) {
      mqttClient.disconnect();
      return undefined;
    }

    if (!env.mqttBrokerUrl || !env.mqttDefaultTopic) {
      if (__DEV__) {
        console.warn(
          '[MQTT] Listener is disabled until mqttBrokerUrl and mqttDefaultTopic are configured.',
        );
      }
      return undefined;
    }

    mqttClient.connect(env.mqttBrokerUrl);

    return () => {
      mqttClient.disconnect();
    };
  }, [status]);
}
