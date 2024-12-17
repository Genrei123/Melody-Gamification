import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import { 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Paper, 
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { JINGLE_BELLS, NOTES } from './constants';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const NoteButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  minWidth: '60px',
}));

const GameController = () => {
  const { gameId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { musicName, uploaderName } = location.state || {};

  const [port, setPort] = useState(null);
  const [writer, setWriter] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [noteIndex, setNoteIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);
  const [controllerMode, setControllerMode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const note = NOTES.find(n => n.ascii === event.keyCode);
      if (note && gameStarted && !controllerMode) {
        handleNoteClick(note.note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStarted, noteIndex, score, message, autoPlayEnabled, controllerMode]);

  const connectToGizduino = async () => {
    if ("serial" in navigator) {
      try {
        const newPort = await navigator.serial.requestPort();
        await newPort.open({ baudRate: 9600 });
        setPort(newPort);

        const textEncoder = new TextEncoderStream();
        await textEncoder.readable.pipeTo(newPort.writable);
        const writerInstance = textEncoder.writable.getWriter();
        setWriter(writerInstance);

        setMessage("Connected to Gizduino!");
      } catch (error) {
        console.error("Error connecting to Gizduino:", error);
        setMessage("Failed to connect to Gizduino. See console for details.");
      }
    } else {
      setMessage("Web Serial API is not supported in this browser.");
    }
  };

  const disconnectFromGizduino = async () => {
    try {
      if (writer) {
        await writer.close();
        setWriter(null);
      }
      if (port) {
        await port.close();
        setPort(null);
      }
      setMessage("Disconnected from Gizduino.");
    } catch (error) {
      console.error("Error disconnecting from Gizduino:", error);
      setMessage("Failed to disconnect. See console for details.");
    }
  };

  const sendNote = async (note) => {
    if (writer) {
      try {
        await writer.write(note + "\n");
        console.log("Sent note:", note);
      } catch (error) {
        console.error("Error sending note:", error);
        setMessage("Failed to send note. See console for details.");
      }
    } else {
      setMessage("Please connect to Gizduino first.");
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
      setNoteIndex(prev => prev + 1);
      setScore(prev => prev + 1);
      setMessage("Correct!");

      if (noteIndex + 1 >= JINGLE_BELLS.length) {
        setGameStarted(false);
        setMessage("Congratulations! You played the song!");
        setAutoPlayEnabled(true);
      }
    } else {
      setMessage(`Wrong note! Expected "${correctNote}". Try again.`);
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
      setMessage("Please connect to Gizduino first.");
      return;
    }

    setMessage("Auto-playing Jingle Bells...");
    setGameStarted(false);

    for (const note of JINGLE_BELLS) {
      await sendNote(note);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setMessage("Jingle Bells auto-play complete!");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setGameStarted(false);
      setNoteIndex(0);
      setScore(0);
      setMessage("");
      setAutoPlayEnabled(false);
      await disconnectFromGizduino();
      navigate('/login');
    } catch (error) {
      console.error("Logout Error:", error);
      setMessage("Failed to logout. See console for details.");
    }
  };

  const toggleControllerMode = () => {
    setControllerMode(prev => !prev);
    setMessage(controllerMode ? "Controller mode disabled." : "Controller mode enabled.");
  };

  return (
    <Container maxWidth="md">
      <StyledPaper elevation={3}>
        <Typography variant="h4" gutterBottom>{musicName}</Typography>
        <Typography variant="subtitle1" gutterBottom>Uploaded by: {uploaderName}</Typography>
        
        <Box my={2}>
          <Button variant="contained" color="primary" onClick={connectToGizduino} disabled={!!port} sx={{ m: 1 }}>
            Connect to Gizduino
          </Button>
          <Button variant="contained" color="secondary" onClick={disconnectFromGizduino} disabled={!port} sx={{ m: 1 }}>
            Disconnect
          </Button>
          <Button variant="contained" color="success" onClick={startGame} disabled={gameStarted} sx={{ m: 1 }}>
            Start Game
          </Button>
          <Button variant="contained" color="info" onClick={autoPlaySong} disabled={!autoPlayEnabled || gameStarted} sx={{ m: 1 }}>
            Auto-Play Jingle Bells
          </Button>
          <Button variant="contained" color="error" onClick={handleLogout} sx={{ m: 1 }}>
            Logout
          </Button>
          <Button variant="contained" color="warning" onClick={toggleControllerMode} sx={{ m: 1 }}>
            {controllerMode ? "Disable Controller Mode" : "Enable Controller Mode"}
          </Button>
        </Box>

        <Box my={2}>
          <Typography variant="h6">Score: {score} / {JINGLE_BELLS.length}</Typography>
        </Box>

        <Grid container spacing={2} justifyContent="center">
          {NOTES.map(({ note, ascii }) => (
            <Grid item key={note}>
              <NoteButton
                variant="outlined"
                onClick={() => handleNoteClick(note)}
                disabled={!gameStarted || controllerMode}
              >
                {note} <br /> (ASCII: {ascii})
              </NoteButton>
            </Grid>
          ))}
        </Grid>

        {controllerMode && (
          <Box mt={2}>
            <Typography variant="body1">Controller Mode Activated. Awaiting input from controller...</Typography>
          </Box>
        )}
      </StyledPaper>

      <Snackbar open={!!message} autoHideDuration={6000} onClose={() => setMessage("")}>
        <Alert onClose={() => setMessage("")} severity="info" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default GameController;

