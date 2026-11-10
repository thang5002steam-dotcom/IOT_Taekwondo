from __future__ import annotations

import asyncio
import json

from amqtt.client import MQTTClient


async def main() -> None:
    client = MQTTClient()
    await client.connect("mqtt://127.0.0.1:1883")
    try:
        payload = {"temperature": 29.5, "humidity": 74}
        await client.publish("esp32/esp32-01/sensor", json.dumps(payload).encode("utf-8"), qos=1, retain=False)
        print("Published esp32/esp32-01/sensor:", json.dumps(payload))
    finally:
        await client.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
