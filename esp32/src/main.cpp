#include <Arduino.h>

#include "commands/SerialCommands.h"
#include "config.h"
#include "mqtt/MqttManager.h"
#include "pir/PirSensor.h"
#include "wifi/WifiManager.h"

namespace {
WifiManager wifiManager;
MqttManager mqttManager;
SerialCommands serialCommands(mqttManager);
PirSensor pirSensor(Config::PIR_PIN, Config::PIR_WARMUP_MS);

// Luu trang thai PIR lan truoc de chi xu ly khi co thay doi
bool lastPirState = false;
} // namespace

void setup() {
  Serial.begin(115200);
  Serial.setTimeout(1000);

  Serial.println();
  Serial.println("========== ESP32 SENSOR MQTT ==========");
  Serial.println("Serial Monitor: 115200 baud, Newline.");
  Serial.println("Lenh gui thu cong: SCAN");

  wifiManager.begin();
  mqttManager.begin();
  pirSensor.begin();
}

void loop() {
  wifiManager.tick();
  mqttManager.tick(wifiManager.isConnected());
  serialCommands.tick();

  pirSensor.update();

  // Chi publish khi PIR da san sang VA trang thai thay doi
  if (pirSensor.isReady()) {
    bool currentState = pirSensor.isMotionDetected();
    if (currentState != lastPirState) {
      lastPirState = currentState;

      if (currentState) {
        Serial.println("[PIR] LOW -> HIGH, gui gia tri random 1-10.");
        mqttManager.publishSensorSample();
      } else {
        Serial.println("[PIR] HIGH -> LOW.");
      }
    }
  }

  delay(10);
}
