#pragma once

#include <Arduino.h>

namespace Config {
constexpr char WIFI_SSID[] = "YOUR_WIFI_SSID";
constexpr char WIFI_PASSWORD[] = "YOUR_WIFI_PASSWORD";

// Use the LAN IPv4 address of the computer running iot_mqtt.
constexpr char MQTT_BROKER[] = "YOUR_BROKER_IPV4";
constexpr uint16_t MQTT_PORT = 1883;
constexpr char DEVICE_ID[] = "esp32-01";
constexpr char SENSOR_TOPIC[] = "esp32/esp32-01/sensor";
constexpr char SENSOR_PAYLOAD[] = "{\"temperature\":29.5,\"humidity\":74}";
constexpr char PIR_TOPIC[] = "esp32/esp32-01/sensor";
constexpr uint8_t PIR_PIN = 27;
constexpr uint32_t PIR_WARMUP_MS = 10000;

constexpr unsigned long MQTT_RETRY_MS = 5000;
constexpr unsigned long WIFI_STATUS_INTERVAL_MS = 5000;
constexpr unsigned long MQTT_KEEP_ALIVE_MS = 30UL * 1000UL;
constexpr unsigned long MQTT_CONNECTION_TIMEOUT_MS = 5000;
constexpr int MQTT_QOS = 1;
} // namespace Config
