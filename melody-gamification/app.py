from flask import Flask, request, jsonify
from flask_cors import CORS
import serial
import time

app = Flask(__name__)
CORS(app)

SERIAL_PORT = "COM6"  # Adjust this to match your COM port
BAUD_RATE = 9600

# Open the serial connection
try:
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    print(f"Connected to {SERIAL_PORT} at {BAUD_RATE} baud.")
except Exception as e:
    print(f"Failed to connect to {SERIAL_PORT}: {e}")
    ser = None

@app.route('/send-note', methods=['POST'])
def send_note():
    if not ser:
        return jsonify({"error": "Serial connection not established."}), 500
    
    try:
        data = request.json
        note = data.get("note", "")
        if note:
            command = f"PLAY_NOTE_{note}\n"
            ser.write(command.encode())
            ser.flush()  # Ensure the data is sent
            time.sleep(0.1)  # Short delay to prevent flooding
            print(f"Sent to Arduino: {command}")
            return jsonify({"status": "success", "sent": note})
        else:
            return jsonify({"error": "No note provided"}), 400
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
