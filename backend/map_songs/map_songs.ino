const int buzzerPin = 8; // Buzzer connected to pin 8
const int ledPins[] = {2, 3, 4, 5, 6, 7, 8}; // LEDs connected to these pins
String receivedData = "";

void setup() {
  Serial.begin(9600); // Initialize Serial Communication
  for (int i = 0; i < 7; i++) {
    pinMode(ledPins[i], OUTPUT);
  }
  pinMode(buzzerPin, OUTPUT);
}

void loop() {
  if (Serial.available() > 0) {
    char receivedChar = Serial.read();
    if (receivedChar == '\n') {
      playNote();
      receivedData = ""; // Reset after playing
    } else {
      receivedData += receivedChar; // Accumulate received characters
    }
  }
}

void playNote() {
  int noteIndex = getNoteIndex(receivedData);
  if (receivedData == "R") { // Handle rest
    delay(500); // Rest duration
  } else if (noteIndex != -1) {
    digitalWrite(ledPins[noteIndex], HIGH); // Light up corresponding LED
    tone(buzzerPin, getFrequency(noteIndex), 500); // Play the note on buzzer
    delay(500);
    digitalWrite(ledPins[noteIndex], LOW); // Turn off LED
  }
}

int getNoteIndex(String note) {
  String notes[] = {"C", "D", "E", "F", "G", "A", "B"};
  for (int i = 0; i < 7; i++) {
    if (note == notes[i]) {
      return i;
    }
  }
  return -1; // Invalid note
}


int getFrequency(int noteIndex) {
  int frequencies[] = {261, 294, 329, 349, 392, 440, 493}; // Frequencies for C, D, E, F, G, A, B
  return frequencies[noteIndex];
}
