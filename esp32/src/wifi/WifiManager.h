#pragma once

#include <Arduino.h>
#include <WiFi.h>

class WifiManager {
 public:
  void begin();
  void tick();
  bool isConnected() const;

 private:
  static const char* statusText(wl_status_t status);

  unsigned long lastStatusMs_ = 0;
  bool connectionAnnounced_ = false;
};
