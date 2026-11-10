import Constants from 'expo-constants';

type AppExtra = {
  apiUrlJava?: string;
  mqttEnabled?: boolean;
  mqttBrokerUrl?: string;
  mqttDefaultTopic?: string;
};

const extra = Constants.expoConfig?.extra as AppExtra | undefined;

export const env = {
  javaApiUrl: extra?.apiUrlJava ?? 'http://localhost:8080/api/v1',
  mqttEnabled:
    typeof extra?.mqttEnabled === 'boolean'
      ? extra.mqttEnabled
      : process.env.EXPO_PUBLIC_MQTT_ENABLED === 'true',
  mqttBrokerUrl: extra?.mqttBrokerUrl?.trim() || null,
  mqttDefaultTopic: extra?.mqttDefaultTopic?.trim() || null,
  apiTimeoutMs: 30_000,
} as const;
