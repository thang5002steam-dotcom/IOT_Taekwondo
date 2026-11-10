from __future__ import annotations

import asyncio
import contextlib
import logging

from app.broker import create_broker
from app.config import load_settings
from app.logging_config import configure_logging
from app.mqtt_relay import MqttRelay


async def main() -> None:
    settings = load_settings()
    configure_logging(settings.log_level)
    logger = logging.getLogger(__name__)

    broker = create_broker(settings)
    relay = MqttRelay(settings)
    try:
        await broker.start()
        logger.info("[Broker] MQTT TCP listening on %s:%s", settings.mqtt_tcp_host, settings.mqtt_tcp_port)
        logger.info("[Broker] MQTT WebSocket listening on %s:%s", settings.mqtt_ws_host, settings.mqtt_ws_port)
        await relay.start()
        await asyncio.Event().wait()
    finally:
        logger.info("Shutting down MQTT relay and broker")
        await relay.stop()
        with contextlib.suppress(Exception):
            await broker.shutdown()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
