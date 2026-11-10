import { useEffect } from 'react';
import { env } from '@/config/env';
import { mqttClient } from './mqttClient';
import { useToast } from '@/shared/ui/Toast';

interface UseMqttToastOptions {
  topic?: string;
  brokerUrl?: string;
  enabled?: boolean;
}

/**
 * Hook tạm thời lắng nghe dữ liệu từ MQTT broker và hiển thị Toast lên UI
 */
export function useMqttToast(options: UseMqttToastOptions = {}) {
  const {
    topic = env.mqttDefaultTopic,
    brokerUrl = env.mqttBrokerUrl,
    enabled = env.mqttEnabled,
  } = options;

  const toast = useToast();

  useEffect(() => {
    if (!enabled || !topic || !brokerUrl) return;

    mqttClient.connect(brokerUrl);

    const unsubscribe = mqttClient.subscribe(topic, (message) => {
      toast.show({
        message: `[${message.topic}] ${message.rawPayload}`,
        variant: 'info',
        duration: 3500,
      });
    });

    return () => {
      unsubscribe();
    };
  }, [topic, brokerUrl, enabled, toast]);
}
