from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv


def _env_int(name: str, default: int) -> int:
    value = os.getenv(name, str(default))
    try:
        return int(value)
    except ValueError as error:
        raise ValueError(f"{name} must be an integer, got {value!r}") from error


@dataclass(frozen=True, slots=True)
class Settings:
    mqtt_tcp_host: str
    mqtt_tcp_port: int
    mqtt_ws_host: str
    mqtt_ws_port: int
    mqtt_internal_host: str
    mqtt_internal_port: int
    esp32_input_topic: str
    mobile_output_topic: str
    mqtt_qos: int
    log_level: str

    @property
    def internal_broker_url(self) -> str:
        return f"mqtt://{self.mqtt_internal_host}:{self.mqtt_internal_port}"


def load_settings() -> Settings:
    load_dotenv()
    settings = Settings(
        mqtt_tcp_host=os.getenv("MQTT_TCP_HOST", "0.0.0.0"),
        mqtt_tcp_port=_env_int("MQTT_TCP_PORT", 1883),
        mqtt_ws_host=os.getenv("MQTT_WS_HOST", "0.0.0.0"),
        mqtt_ws_port=_env_int("MQTT_WS_PORT", 9001),
        mqtt_internal_host=os.getenv("MQTT_INTERNAL_HOST", "127.0.0.1"),
        mqtt_internal_port=_env_int("MQTT_INTERNAL_PORT", 1883),
        esp32_input_topic=os.getenv("ESP32_INPUT_TOPIC", "esp32/+/sensor"),
        mobile_output_topic=os.getenv("MOBILE_OUTPUT_TOPIC", "taekwondo/events"),
        mqtt_qos=_env_int("MQTT_QOS", 1),
        log_level=os.getenv("LOG_LEVEL", "INFO").upper(),
    )
    if settings.mqtt_qos not in (0, 1, 2):
        raise ValueError("MQTT_QOS must be 0, 1, or 2")
    return settings
