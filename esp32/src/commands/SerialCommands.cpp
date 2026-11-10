#include "commands/SerialCommands.h"

#include <Arduino.h>

#include "mqtt/MqttManager.h"

SerialCommands::SerialCommands(MqttManager& mqttManager)
    : mqttManager_(mqttManager) {}

void SerialCommands::tick() {
  if (Serial.available() <= 0) return;

  String command = Serial.readStringUntil('\n');
  command.trim();
  if (command.equalsIgnoreCase("SCAN")) {
    Serial.println("[NHAN LENH] SCAN");
    mqttManager_.publishSensorSample();
  } else if (command.length() > 0) {
    Serial.print("[LENH KHONG DUNG] Ban vua nhap: ");
    Serial.println(command);
    Serial.println("Nhap SCAN roi Enter de gui sensor sample.");
  }
}
