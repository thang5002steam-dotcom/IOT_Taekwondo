
#pragma once

#include <Arduino.h>

/**
 * Quan ly cam bien chuyen dong PIR HC-SR501.
 *
 * - Doc tin hieu HIGH/LOW tu GPIO.
 * - Cho PIR khoi dong on dinh.
 * - Phat hien thay doi trang thai.
 * - Khong block chuong trinh.
 */
class PirSensor {
public:
  explicit PirSensor(uint8_t pin = 27, uint32_t warmupMs = 60000);

  // Khoi tao cam bien
  void begin();

  // Goi lien tuc trong loop()
  void update();

  // Trang thai phat hien chuyen dong
  bool isMotionDetected() const;

  // Cam bien da khoi dong xong?
  bool isReady() const;

private:
  uint8_t _pin;
  uint32_t _warmupMs;
  uint32_t _startMillis;

  bool _ready;
  bool _motionDetected;
  int _lastState;
};
