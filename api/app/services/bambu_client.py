import json
import ssl
import socket

from app.core.config import config
import paho.mqtt.client as mqtt

MQTT_PORT = 8883
MQTT_USERNAME = "bblp"
HOST = config.printer_ip
ACCESS_CODE = config.printer_access_code
SERIAL = config.printer_serial

REPORT_TOPIC  = f"device/{SERIAL}/report"   # printer → us
REQUEST_TOPIC = f"device/{SERIAL}/request"  # us → printer

class BambuClient:
    def __init__(self) -> None:
        self.host = config.printer_ip
        self.access_code = config.printer_access_code
        self.serial = config.printer_serial

    def get_status(self) -> dict[str, object]:
        return {
            "connected": False,
            "host": self.host,
            "serial": self.serial or None,
            "status": "not_connected",
            "message": "Bambu client is not implemented yet",
        }


def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        print(f"Connected to {HOST}")
        client.subscribe(REPORT_TOPIC)
        print(f"Subscribed to: {REPORT_TOPIC}")
        push_all = json.dumps({"pushing": {"sequence_id": "0", "command": "pushall"}})
        client.publish(REQUEST_TOPIC, push_all)
        print("Sent 'pushall' request\n")

    else:
        codes = {
            1: "Incorrect protocol version",
            2: "Invalid client identifier",
            3: "Server unavailable",
            4: "Bad username or password – check your ACCESS_CODE",
            5: "Not authorised",
        }
        print(f"Connection refused: {codes.get(rc, f'rc={rc}')}")


def on_disconnect(client, userdata, rc, properties=None, reason_code=None):
    print(f"Disconnected (rc={rc})")


def on_message(client, userdata, msg):
    try:
        data = json.loads(msg.payload)
    except (json.JSONDecodeError, UnicodeDecodeError):
        print(f"Could not decode message on {msg.topic}")
        return

    # The printer nests everything under a top-level key like "print" or "info"
    section = next(iter(data), None)
    payload = data.get(section, {})
    command = payload.get("command", "?")

    print(f"[{section}] command={command}")

    # ── Print a few useful fields if this is a status push ───────────────────
    if command in ("push_status", "pushall"):
        interesting = {
            "gcode_state": payload.get("gcode_state"),  # IDLE / RUNNING / PAUSE …
            "nozzle_temper": payload.get("nozzle_temper"),  # current nozzle temp
            "nozzle_target": payload.get("nozzle_target_temper"),  # target nozzle temp
            "bed_temper": payload.get("bed_temper"),  # current bed temp
            "bed_target": payload.get("bed_target_temper"),  # target bed temp
            "wifi_signal": payload.get("wifi_signal"),  # e.g. "-56dBm"
            "mc_percent": payload.get("mc_percent"),  # print progress %
            "mc_remaining_time": payload.get("mc_remaining_time"),  # minutes left
            "layer_num": payload.get("layer_num"),
            "total_layer_num": payload.get("total_layer_num"),
        }
        for key, value in interesting.items():
            if value is not None:
                print(f"    {key}: {value}")

    print()  # blank line between messages



def main():
    client = mqtt.Client(
        client_id=SERIAL,
        protocol=mqtt.MQTTv311,
        callback_api_version=mqtt.CallbackAPIVersion.VERSION2,
    )

    client.tls_set(tls_version=ssl.PROTOCOL_TLS_CLIENT, cert_reqs=ssl.CERT_NONE)
    client.tls_insecure_set(True)
    client.username_pw_set(MQTT_USERNAME, ACCESS_CODE)

    client.on_connect    = on_connect
    client.on_disconnect = on_disconnect
    client.on_message    = on_message

    print(f"Connecting to {HOST}:{MQTT_PORT} …")

    try:
        client.connect(HOST, MQTT_PORT, keepalive=60)
        client.loop_forever()
    except (TimeoutError, socket.timeout, ConnectionRefusedError, OSError) as e:
        print(f"Printer unreachable at {HOST}:{MQTT_PORT} — {e}")
        print("Is the printer on and in LAN mode?")
    except KeyboardInterrupt:
        print("Stopped.")
        client.disconnect()

