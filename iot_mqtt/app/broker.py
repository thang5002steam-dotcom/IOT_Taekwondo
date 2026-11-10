from __future__ import annotations

from amqtt.broker import Broker

from app.config import Settings


def create_broker(settings: Settings) -> Broker:
    """Create one broker with TCP MQTT and MQTT-over-WebSocket listeners."""
    config = {
        "listeners": {
            "default": {
                "type": "tcp",
                "bind": f"{settings.mqtt_tcp_host}:{settings.mqtt_tcp_port}",
            },
            "websocket": {
                "type": "ws",
                "bind": f"{settings.mqtt_ws_host}:{settings.mqtt_ws_port}",
            },
        },
        "plugins": {
            "amqtt.plugins.authentication.AnonymousAuthPlugin": {
                "allow_anonymous": True,
            },
        },
    }
    return Broker(config)
