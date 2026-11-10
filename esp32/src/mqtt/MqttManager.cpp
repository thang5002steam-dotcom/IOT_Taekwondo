#include "mqtt/MqttManager.h"

#include "config.h"

MqttManager::MqttManager() : mqttClient_(wifiClient_) {}

void MqttManager::begin() {
  mqttClient_.setId(Config::DEVICE_ID);
  mqttClient_.setKeepAliveInterval(Config::MQTT_KEEP_ALIVE_MS);
  mqttClient_.setConnectionTimeout(Config::MQTT_CONNECTION_TIMEOUT_MS);
}

void MqttManager::tick(bool wifiConnected) {
  if (!wifiConnected) {
    if (mqttClient_.connected())
      mqttClient_.stop();
    attempted_ = false;
    return;
  }

  if (mqttClient_.connected()) {
    mqttClient_.poll();
    return;
  }

  const unsigned long now = millis();
  if (attempted_ && now - lastAttemptMs_ < Config::MQTT_RETRY_MS)
    return;

  attempted_ = true;
  lastAttemptMs_ = now;
  Serial.print("[MQTT] Dang ket noi broker ");
  Serial.print(Config::MQTT_BROKER);
  Serial.print(":");
  Serial.println(Config::MQTT_PORT);

  if (mqttClient_.connect(Config::MQTT_BROKER, Config::MQTT_PORT)) {
    Serial.println("[MQTT] DA KET NOI broker.");
    Serial.print("[MQTT] San sang gui toi topic: ");
    Serial.println(Config::SENSOR_TOPIC);
    return;
  }

  Serial.print("[MQTT] Ket noi that bai, ma loi: ");
  Serial.println(mqttClient_.connectError());
  Serial.println("Goi y: kiem tra IPv4 broker, port 1883, cung Wi-Fi va "
                 "Windows Firewall.");
}

bool MqttManager::publishSensorSample() {
  if (!mqttClient_.connected()) {
    Serial.println("[LOI] ESP32 chua ket noi MQTT broker.");
    return false;
  }

  const int randomValue = random(1, 11);
  char payload[24];
  snprintf(payload, sizeof(payload), "{\"value\":%d}", randomValue);
  const size_t payloadLength = strlen(payload);
  if (!mqttClient_.beginMessage(Config::SENSOR_TOPIC,
                                static_cast<unsigned long>(payloadLength),
                                false, Config::MQTT_QOS)) {
    Serial.println(
        "[LOI MQTT] beginMessage that bai; dong ket noi de thu lai.");
    mqttClient_.stop();
    return false;
  }
  if (mqttClient_.write(reinterpret_cast<const uint8_t *>(payload),
                        payloadLength) != payloadLength) {
    Serial.println("[LOI MQTT] Ghi payload that bai; dong ket noi de thu lai.");
    mqttClient_.stop();
    return false;
  }
  if (!mqttClient_.endMessage()) {
    Serial.println("[LOI MQTT] Publish that bai hoac khong nhan duoc PUBACK.");
    mqttClient_.stop();
    return false;
  }

  Serial.println("[THANH CONG] DA GUI MQTT (QoS 1, da nhan PUBACK).");
  Serial.print("Topic: ");
  Serial.println(Config::SENSOR_TOPIC);
  Serial.print("Payload: ");
  Serial.println(payload);
  return true;
}

bool MqttManager::publishPirState(bool motionDetected) {
  if (!mqttClient_.connected()) {
    Serial.println("[LOI] ESP32 chua ket noi MQTT broker.");
    return false;
  }

  // Tao payload JSON: {"motion":true} hoac {"motion":false}
  char payload[24];
  snprintf(payload, sizeof(payload), "{\"motion\":%s}",
           motionDetected ? "true" : "false");
  const size_t payloadLength = strlen(payload);

  if (!mqttClient_.beginMessage(Config::PIR_TOPIC,
                                static_cast<unsigned long>(payloadLength),
                                false, Config::MQTT_QOS)) {
    Serial.println("[LOI MQTT] PIR beginMessage that bai.");
    mqttClient_.stop();
    return false;
  }
  if (mqttClient_.write(reinterpret_cast<const uint8_t *>(payload),
                        payloadLength) != payloadLength) {
    Serial.println("[LOI MQTT] PIR ghi payload that bai.");
    mqttClient_.stop();
    return false;
  }
  if (!mqttClient_.endMessage()) {
    Serial.println(
        "[LOI MQTT] PIR publish that bai hoac khong nhan duoc PUBACK.");
    mqttClient_.stop();
    return false;
  }

  Serial.println("[PIR] DA GUI MQTT.");
  Serial.print("Topic: ");
  Serial.println(Config::PIR_TOPIC);
  Serial.print("Payload: ");
  Serial.println(payload);
  return true;
}
