# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import time
from serial_connection import SerialConnection

app = Flask(__name__)
CORS(app)

SERIAL_PORT = "COM6"  # Adjust this to match your COM port
BAUD_RATE = 9600

# Initialize the serial connection
ser = SerialConnection.get_instance(SERIAL_PORT, BAUD_RATE)

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
            print(f"Sent to HC-05: {command}")
            return jsonify({"status": "success", "sent": note})
        else:
            return jsonify({"error": "No note provided"}), 400
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000, threaded=False)  # Disable threading
