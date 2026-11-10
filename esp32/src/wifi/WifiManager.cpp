#include "wifi/WifiManager.h"

#include "config.h"

void WifiManager::begin() {
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  Serial.print("[WiFi] Dang ket noi toi SSID: ");
  Serial.println(Config::WIFI_SSID);
  WiFi.begin(Config::WIFI_SSID, Config::WIFI_PASSWORD);
}

void WifiManager::tick() {
  if (isConnected()) {
    if (!connectionAnnounced_) {
      connectionAnnounced_ = true;
      Serial.print("[WiFi] DA KET NOI. IP ESP32: ");
      Serial.println(WiFi.localIP());
      Serial.print("[WiFi] Tin hieu RSSI: ");
      Serial.print(WiFi.RSSI());
      Serial.println(" dBm");
    }
    return;
  }

  connectionAnnounced_ = false;
  const unsigned long now = millis();
  if (now - lastStatusMs_ >= Config::WIFI_STATUS_INTERVAL_MS) {
    lastStatusMs_ = now;
    Serial.print("[WiFi] Dang doi ket noi; trang thai: ");
    Serial.println(statusText(WiFi.status()));
  }
}

bool WifiManager::isConnected() const { return WiFi.status() == WL_CONNECTED; }

const char* WifiManager::statusText(wl_status_t status) {
  switch (status) {
    case WL_CONNECTED:
      return "connected";
    case WL_NO_SSID_AVAIL:
      return "SSID not found; check Wi-Fi name / 2.4 GHz";
    case WL_CONNECT_FAILED:
      return "connection failed; check Wi-Fi password";
    case WL_CONNECTION_LOST:
      return "connection lost; retrying";
    case WL_DISCONNECTED:
      return "disconnected; waiting for Wi-Fi reconnect";
    default:
      return "connecting / status pending";
  }
}
