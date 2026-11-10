export type MqttMessage = {
  topic: string;
  rawPayload: string;
  payload: unknown;
  receivedAt: Date;
};

export type MessageHandler = (message: MqttMessage) => void;

export interface MqttService {
  connect: (brokerUrl: string) => void;
  subscribe: (topic: string, handler: MessageHandler) => () => void;
  publish: (topic: string, message: string) => void;
  disconnect: () => void;
}
