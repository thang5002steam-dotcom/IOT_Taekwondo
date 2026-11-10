# Embedded MQTT Broker + IoT Relay

The project starts an aMQTT broker and a relay in one Python process. It exposes MQTT TCP for ESP32 devices and MQTT-over-WebSocket for Expo.

## Setup

```powershell
conda activate iot-amqtt
python -m pip install -r requirements.txt
```

Copy `.env.example` to `.env` only when defaults need to change. Do not replace `0.0.0.0` with a laptop LAN address.

## Run

```powershell
python main.py
```

ESP32 publishes QoS 1 messages to `esp32/{deviceId}/sensor` at `<laptop-ipv4>:1883`.

Expo subscribes to `taekwondo/events` using MQTT-over-WebSocket at `ws://<laptop-ipv4>:9001/mqtt`. The `/mqtt` endpoint has been tested against aMQTT 0.12.1 and keeps the existing Expo configuration compatible.

## Local acceptance check

With the broker running, open two more terminals:

```powershell
python scripts/test_subscriber.py
python scripts/test_publisher.py
```

The subscriber prints the normalized `SENSOR_UPDATE` event.
