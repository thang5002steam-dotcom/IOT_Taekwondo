#pragma once

#include <ArduinoMqttClient.h>
#include <WiFi.h>

class MqttManager {
 public:
  MqttManager();

  void begin();
  void tick(bool wifiConnected);
  bool publishSensorSample();
  bool publishPirState(bool motionDetected);

 private:
  WiFiClient wifiClient_;
  MqttClient mqttClient_;
  unsigned long lastAttemptMs_ = 0;
  bool attempted_ = false;
};
