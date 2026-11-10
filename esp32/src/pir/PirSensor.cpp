
#include "PirSensor.h"

PirSensor::PirSensor(uint8_t pin, uint32_t warmupMs)
    : _pin(pin), _warmupMs(warmupMs), _startMillis(0), _ready(false),
      _motionDetected(false), _lastState(-1) {}

/**
 * Khoi tao chan GPIO va bat dau
 * thoi gian on dinh cua PIR.
 */
void PirSensor::begin() {
  pinMode(_pin, INPUT);

  _startMillis = millis();
  _ready = false;
  _motionDetected = false;
  _lastState = -1;

  Serial.println("[PIR] Khoi dong cam bien...");
}

/**
 * Cap nhat trang thai PIR.
 * Khong su dung delay() de tranh
 * anh huong WiFi, MQTT va cac module khac.
 */
void PirSensor::update() {
  if (!_ready) {
    if (millis() - _startMillis < _warmupMs) {
      return;
    }

    _ready = true;
    Serial.println("[PIR] Cam bien da san sang!");
  }

  int state = digitalRead(_pin);

  // Chi xu ly khi trang thai thay doi
  if (state == _lastState) {
    return;
  }

  _lastState = state;
  _motionDetected = (state == HIGH);

  if (_motionDetected) {
    Serial.println("[PIR] PHAT HIEN CHUYEN DONG!");
  } else {
    Serial.println("[PIR] KHONG CO CHUYEN DONG");
  }
}

/**
 * Tra ve trang thai chuyen dong hien tai.
 */
bool PirSensor::isMotionDetected() const { return _motionDetected; }

/**
 * Kiem tra cam bien da san sang.
 */
bool PirSensor::isReady() const { return _ready; }
