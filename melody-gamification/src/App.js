import React, { useState } from "react";
import './App.css';

const App = () => {
  const [port, setPort] = useState(null);
  const [writer, setWriter] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [noteIndex, setNoteIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);

  // Predefined sequence for "Jingle Bells"
  const JINGLE_BELLS = [
    "E", "E", "E", // Jingle
    "E", "E", "E", // Jingle
    "E", "G", "C", "D", "E", // All the way
    "F", "F", "F", "F", // Oh what fun
    "F", "E", "E", "E", "E", // It is to ride
    "E", "D", "D", "E", "D", "G" // In a one-horse open sleigh
  ];

  const NOTES = ["C", "D", "E", "F", "G", "A", "B"];

  // Connect to Gizduino
  const connectToGizduino = async () => {
    if ("serial" in navigator) {
      try {
        const newPort = await navigator.serial.requestPort();
        await newPort.open({ baudRate: 9600 });
        setPort(newPort);

        const textEncoder = new TextEncoderStream();
        textEncoder.readable.pipeTo(newPort.writable);
        setWriter(textEncoder.writable.getWriter());

        alert("Connected to Gizduino!");
      } catch (error) {
        console.error("Error connecting to Gizduino:", error);
      }
    } else {
      alert("Web Serial API is not supported in this browser.");
    }
  };

  // Disconnect from Gizduino
  const disconnectFromGizduino = async () => {
    if (port) {
      await writer.close();
      await port.close();
      setPort(null);
      setWriter(null);
      alert("Disconnected from Gizduino.");
    }
  };

  // Send a Note
  const sendNote = async (note) => {
    if (writer) {
      await writer.write(note + "\n");
      console.log("Sent note:", note);
    } else {
      alert("Please connect to Gizduino first.");
    }
  };

  // Handle Note Click
  const handleNoteClick = (note) => {
    if (!gameStarted) {
      setMessage("Start the game first!");
      return;
    }

    const correctNote = JINGLE_BELLS[noteIndex];
    if (note === correctNote) {
      sendNote(note);
      setNoteIndex((prev) => prev + 1);
      setScore((prev) => prev + 1);
      setMessage("Correct!");

      // Check if game is over
      if (noteIndex + 1 >= JINGLE_BELLS.length) {
        setGameStarted(false);
        setMessage("Congratulations! You played the song!");
        setAutoPlayEnabled(true); // Enable auto-play button
      }
    } else {
      setMessage("Wrong note! Try again.");
    }
  };

  // Start the Game
  const startGame = () => {
    setGameStarted(true);
    setNoteIndex(0);
    setScore(0);
    setMessage("Follow the sequence to play Jingle Bells!");
    setAutoPlayEnabled(false);
  };

  // Auto-Play the Song
  const autoPlaySong = async () => {
    if (!writer) {
      alert("Please connect to Gizduino first.");
      return;
    }

    setMessage("Auto-playing Jingle Bells...");
    for (const note of JINGLE_BELLS) {
      await sendNote(note);
      await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay between notes
    }
    setMessage("Jingle Bells auto-play complete!");
  };

  return (
    <div>
      <h1>Melody Gamification - Jingle Bells</h1>
      <button onClick={connectToGizduino}>Connect to Gizduino</button>
      <button onClick={disconnectFromGizduino} disabled={!port}>
        Disconnect
      </button>
      <button onClick={startGame} disabled={gameStarted}>
        Start Game
      </button>
      <button onClick={autoPlaySong} disabled={!autoPlayEnabled}>
        Auto-Play Jingle Bells
      </button>
      <p>{message}</p>
      <p>Score: {score}/{JINGLE_BELLS.length}</p>
      <div>
        {NOTES.map((note) => (
          <button key={note} onClick={() => handleNoteClick(note)} disabled={!gameStarted}>
            {note}
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
