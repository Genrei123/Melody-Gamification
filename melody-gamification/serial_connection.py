# serial_connection.py
import serial
import threading

class SerialConnection:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, port, baudrate):
        with cls._lock:
            if cls._instance is None:
                try:
                    cls._instance = serial.Serial(port, baudrate, timeout=1)
                    print(f"Connected to {port} at {baudrate} baud.")
                except Exception as e:
                    print(f"Failed to connect to {port}: {e}")
                    cls._instance = None
        return cls._instance

    @classmethod
    def get_instance(cls, port, baudrate):
        if cls._instance is None:
            cls(port, baudrate)
        return cls._instance
