from __future__ import annotations

import asyncio

from amqtt.client import MQTTClient


async def main() -> None:
    client = MQTTClient()
    await client.connect("mqtt://127.0.0.1:1883")
    await client.subscribe([("taekwondo/events", 1)])
    print("Subscribed to taekwondo/events; waiting for one event...")
    try:
        message = await client.deliver_message()
        if message is not None:
            print(bytes(message.data).decode("utf-8"))
    finally:
        await client.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
