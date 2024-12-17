import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import { 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Box,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled } from '@mui/material/styles';
import { JINGLE_BELLS, NOTES } from './constants';

// Add styled components here
const StyledPaper = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  marginTop: theme.spacing(4),
}));

const NoteButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isActive'
})(({ theme, isActive }) => ({
  backgroundColor: isActive ? theme.palette.primary.light : 'inherit',
  margin: theme.spacing(1),
  minWidth: '100px',
}));

const GameController = () => {
  const { gameId } = useParams(); // Keep gameId for potential future use
  const location = useLocation();
  const navigate = useNavigate();
  
  const { musicName, uploaderName, notes } = location.state || {};

  const [port, setPort] = useState(null);
  const [writer, setWriter] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [noteIndex, setNoteIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);
  const [controllerMode, setControllerMode] = useState(false);
  const [activeNotes, setActiveNotes] = useState({});

  // Use the notes passed from the HomePage instead of JINGLE_BELLS
  const currentNotes = notes ? notes.split(',') : JINGLE_BELLS;

  // Use useCallback to memoize the handleNoteClick function
  const handleNoteClick = useCallback((note) => {
    if (!gameStarted) {
      setMessage("Start the game first!");
      return;
    }

    const correctNote = currentNotes[noteIndex];
    if (note === correctNote) {
      sendNote(note);
      setNoteIndex(prev => prev + 1);
      setScore(prev => prev + 1);
      setMessage("Correct!");

      if (noteIndex + 1 >= currentNotes.length) {
        setGameStarted(false);
        setMessage("Congratulations! You played the song!");
        setAutoPlayEnabled(true);
      }
    } else {
      setMessage(`Wrong note! Expected "${correctNote}". Try again.`);
    }
  }, [gameStarted, noteIndex, currentNotes]);

  // Add sendNote function definition
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

  useEffect(() => {
    const handleKeyDown = (event) => {
      const note = NOTES.find(n => n.ascii === event.keyCode);
      if (note) {
        setActiveNotes(prev => ({
          ...prev,
          [note.note]: true
        }));
        
        if (gameStarted && !controllerMode) {
          handleNoteClick(note.note);
        }
      }
    };
    const handleKeyUp = (event) => {
      const note = NOTES.find(n => n.ascii === event.keyCode);
      if (note) {
        setActiveNotes(prev => ({
          ...prev,
          [note.note]: false
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, noteIndex, score, message, autoPlayEnabled, controllerMode, handleNoteClick]);

  const handleBackToHomepage = () => {
    // Optional: Add a confirmation dialog if game is in progress
    const confirmLeave = window.confirm(
      "Are you sure you want to leave the game? Your progress will be lost."
    );
    
    if (confirmLeave) {
      // Reset game state
      setGameStarted(false);
      setNoteIndex(0);
      setScore(0);
      setMessage("");
      
      // Navigate back to homepage
      navigate('/');
    }
  };

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

  const startGame = () => {
    setGameStarted(true);
    setNoteIndex(0);
    setScore(0);
    setMessage(`Follow the sequence to play ${musicName || 'the song'}!`);
    setAutoPlayEnabled(false);
  };

  const autoPlaySong = async () => {
    if (!writer) {
      setMessage("Please connect to Gizduino first.");
      return;
    }

    setMessage(`Auto-playing ${musicName || 'the song'}...`);
    setGameStarted(false);

    for (const note of currentNotes) {
      await sendNote(note);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setMessage(`${musicName || 'Song'} auto-play complete!`);
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
        <Box display="flex" flexDirection="column">
          {/* Back button and title */}
          <Box display="flex" alignItems="center" mb={2}>
            <IconButton 
              color="primary" 
              onClick={handleBackToHomepage}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" gutterBottom>
              {musicName || 'Game Controller'}
            </Typography>
          </Box>
    
          <Typography variant="subtitle1" gutterBottom>
            Uploaded by: {uploaderName || 'Unknown'}
          </Typography>
          
          {/* Buttons Container */}
          <Box my={2}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={connectToGizduino} 
              disabled={!!port} 
              sx={{ m: 1 }}
            >
              Connect to Gizduino
            </Button>
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={disconnectFromGizduino} 
              disabled={!port} 
              sx={{ m: 1 }}
            >
              Disconnect
            </Button>
            <Button 
              variant="contained" 
              color="success" 
              onClick={startGame} 
              disabled={gameStarted} 
              sx={{ m: 1 }}
            >
              Start Game
            </Button>
            <Button 
              variant="contained" 
              color="info" 
              onClick={autoPlaySong} 
              disabled={!autoPlayEnabled || gameStarted} 
              sx={{ m: 1 }}
            >
              Auto-Play Song
            </Button>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleLogout} 
              sx={{ m: 1 }}
            >
              Logout
            </Button>
            <Button 
              variant="contained" 
              color="warning" 
              onClick={toggleControllerMode} 
              sx={{ m: 1 }}
            >
              {controllerMode 
                ? "Disable Controller Mode" 
                : "Enable Controller Mode"}
            </Button>
          </Box>
    
          {/* Score Display */}
          <Box my={2}>
            <Typography variant="h6">
              Score: {score} / {currentNotes.length}
            </Typography>
          </Box>
    
          {/* Notes Grid */}
          <Grid container spacing={2} justifyContent="center">
            {NOTES.map(({ note, ascii }) => (
              <Grid item key={note}>
                <NoteButton
                  variant="outlined"
                  onClick={() => handleNoteClick(note)}
                  disabled={!gameStarted || controllerMode}
                  isActive={activeNotes[note]}
                >
                  {note} <br /> 
                  (ASCII: {ascii}) <br />
                  Key: {String.fromCharCode(ascii)}
                </NoteButton>
              </Grid>
            ))}
          </Grid>
    
          {/* Controller Mode Message */}
          {controllerMode && (
            <Box mt={2}>
              <Typography variant="body1">
                Controller Mode Activated. Awaiting input from controller...
              </Typography>
            </Box>
          )}
        </Box>
      </StyledPaper>
    
      <Snackbar 
        open={!!message} 
        autoHideDuration={6000} 
        onClose={() => setMessage("")}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setMessage("")} 
          severity="info" 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
export default GameController;

