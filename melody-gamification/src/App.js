import React, { useState, useEffect } from "react";
import './App.css';
import Login from './Login';
import Signup from './Signup';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const App = () => {
  const [port, setPort] = useState(null);
  const [writer, setWriter] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [noteIndex, setNoteIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Predefined sequence for "Jingle Bells"
  const JINGLE_BELLS = [
    "E", "E", "E", // Jingle
    "E", "E", "E", // Jingle
    "E", "G", "C", "D", "E", // All the way
    "F", "F", "F", "F", // Oh what fun
    "F", "E", "E", "E", "E", // It is to ride
    "E", "D", "D", "E", "D", "G" // In a one-horse open sleigh
  ];

  const NOTES = [
    { note: "C", ascii: 67 },
    { note: "D", ascii: 68 },
    { note: "E", ascii: 69 },
    { note: "F", ascii: 70 },
    { note: "G", ascii: 71 },
    { note: "A", ascii: 65 },
    { note: "B", ascii: 66 }
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const note = NOTES.find(n => n.ascii === event.keyCode);
      if (note && gameStarted) {
        handleNoteClick(note.note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStarted]);

  const handleLogout = async () => {
    await signOut(auth);
    setGameStarted(false);
    setNoteIndex(0);
    setScore(0);
    setMessage("");
    setAutoPlayEnabled(false);
    setPort(null);
    setWriter(null);
  };

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

  const disconnectFromGizduino = async () => {
    if (port) {
      await writer.close();
      await port.close();
      setPort(null);
      setWriter(null);
      alert("Disconnected from Gizduino.");
    }
  };

  const sendNote = async (note) => {
    if (writer) {
      await writer.write(note + "\n");
      console.log("Sent note:", note);
    } else {
      alert("Please connect to Gizduino first.");
    }
  };

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

      if (noteIndex + 1 >= JINGLE_BELLS.length) {
        setGameStarted(false);
        setMessage("Congratulations! You played the song!");
        setAutoPlayEnabled(true);
      }
    } else {
      setMessage("Wrong note! Try again.");
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setNoteIndex(0);
    setScore(0);
    setMessage("Follow the sequence to play Jingle Bells!");
    setAutoPlayEnabled(false);
  };

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

  if (!isAuthenticated) {
    return (
      <div>
        <h1>Melody Gamification</h1>
        {isLogin ? (
          <Login onLogin={() => setIsAuthenticated(true)} switchToSignup={() => setIsLogin(false)} />
        ) : (
          <Signup onSignup={() => setIsAuthenticated(true)} switchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    );
  }

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
      <button onClick={handleLogout}>Logout</button>
      <p>{message}</p>
      <p>Score: {score}/{JINGLE_BELLS.length}</p>
      <div>
        {NOTES.map(({ note, ascii }) => (
          <button key={note} onClick={() => handleNoteClick(note)} disabled={!gameStarted}>
            {note} (ASCII: {ascii})
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;