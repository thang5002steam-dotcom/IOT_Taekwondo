import mqtt from 'mqtt';

import { MqttClientAdapter } from './mqttClient';

jest.mock('mqtt', () => ({
  __esModule: true,
  default: { connect: jest.fn() },
}));

type Listener = (...args: unknown[]) => void;

function createClient() {
  const listeners = new Map<string, Listener>();
  return {
    connected: false,
    on: jest.fn((event: string, listener: Listener) => listeners.set(event, listener)),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    publish: jest.fn(),
    end: jest.fn(),
    emit: (event: string, ...args: unknown[]) => listeners.get(event)?.(...args),
  };
}

describe('MqttClientAdapter', () => {
  const connectMock = mqtt.connect as jest.Mock;

  beforeEach(() => {
    connectMock.mockReset();
  });

  it('subscribes once per topic and dispatches normalized JSON messages to every handler', () => {
    const client = createClient();
    connectMock.mockReturnValue(client);
    const adapter = new MqttClientAdapter();
    const firstHandler = jest.fn();
    const secondHandler = jest.fn();

    const unsubscribeFirst = adapter.subscribe('shared/topic', firstHandler);
    const unsubscribeSecond = adapter.subscribe('shared/topic', secondHandler);
    adapter.connect('wss://broker.example.com/mqtt');
    client.connected = true;
    client.emit('connect');
    client.emit('message', 'shared/topic', Buffer.from('{"id":1}'));

    expect(client.subscribe).toHaveBeenCalledTimes(1);
    expect(firstHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        topic: 'shared/topic',
        rawPayload: '{"id":1}',
        payload: { id: 1 },
      }),
    );
    expect(secondHandler).toHaveBeenCalledTimes(1);

    client.emit('connect');
    expect(client.subscribe).toHaveBeenCalledTimes(2);

    unsubscribeFirst();
    expect(client.unsubscribe).not.toHaveBeenCalled();
    unsubscribeSecond();
    expect(client.unsubscribe).toHaveBeenCalledWith('shared/topic');
  });

  it('keeps raw text when a payload is not JSON and rejects non-WebSocket URLs', () => {
    const client = createClient();
    connectMock.mockReturnValue(client);
    const adapter = new MqttClientAdapter();
    const handler = jest.fn();

    adapter.connect('mqtt://broker.example.com:1883');
    expect(connectMock).not.toHaveBeenCalled();

    adapter.subscribe('shared/topic', handler);
    adapter.connect('ws://broker.example.com/mqtt');
    client.emit('message', 'shared/topic', Buffer.from('plain text'));

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ rawPayload: 'plain text', payload: 'plain text' }),
    );
  });
});
