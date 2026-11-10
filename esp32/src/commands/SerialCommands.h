#pragma once

class MqttManager;

class SerialCommands {
 public:
  explicit SerialCommands(MqttManager& mqttManager);
  void tick();

 private:
  MqttManager& mqttManager_;
};
