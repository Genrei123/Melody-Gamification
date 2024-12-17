// src/GameController.js
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

const StyledPaper = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  marginTop: theme.spacing(4),
}));

const NoteButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isActive' && prop !== 'isCurrent'
})(({ theme, isActive, isCurrent }) => ({
  backgroundColor: isCurrent 
    ? theme.palette.secondary.light // Highlight current note
    : isActive 
      ? theme.palette.primary.light 
      : 'inherit',
  color: isCurrent ? theme.palette.common.white : theme.palette.text.primary,
  margin: theme.spacing(1),
  minWidth: '100px',
  fontWeight: isCurrent ? 'bold' : 'normal',
  transition: 'background-color 0.2s, transform 0.1s',
  '&:active': {
    transform: 'scale(0.95)',
  },
}));

const GameController = () => {
  const { gameId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { musicName, uploaderName, notes } = location.state || {};

  const [gameStarted, setGameStarted] = useState(false);
  const [noteIndex, setNoteIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [activeNotes, setActiveNotes] = useState({});
  const [gameFinished, setGameFinished] = useState(false);

  const currentNotes = notes ? notes.split(',') : JINGLE_BELLS.split(',');

  // Create a mapping from key codes to notes
  const keyToNoteMap = {};
  NOTES.forEach(({ note, ascii }) => {
    keyToNoteMap[ascii] = note;
  });

  // Handle sending note to backend
  const sendNoteToBackend = async (note) => {
    try {
      const response = fetch("http://localhost:5000/send-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
  
      // Avoid blocking: Timeout to prevent freezing
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timeout")), 1000)
      );
  
      await Promise.race([response, timeout]);
      console.log(`Sent note to backend: ${note}`);
    } catch (error) {
      console.error("Error communicating with backend:", error);
      setMessage("Failed to send note. Check connection.");
    }
  };

  // Handle note clicks (from buttons or keyboard)
  const handleNoteClick = useCallback(async (note) => {
    if (!gameStarted) {
      setMessage("Start the game first!");
      return;
    }
  
    const correctNote = currentNotes[noteIndex];
  
    // Highlight the pressed note
    setActiveNotes(prev => ({ ...prev, [note]: true }));
    setTimeout(() => {
      setActiveNotes(prev => ({ ...prev, [note]: false }));
    }, 200); // Remove highlight after 200ms

    // Optimistically update the UI first
    if (note === correctNote) {
      setNoteIndex((prev) => prev + 1);
      setScore((prev) => prev + 1);
      setMessage("Correct!");

      // Check if the game is finished
      if (noteIndex + 1 >= currentNotes.length) {
        setGameStarted(false);
        setGameFinished(true);
        setMessage("Congratulations! You played the song!");
      }
    } else {
      setMessage(`Wrong note! Expected "${correctNote}". Try again.`);
    }

    // Send the clicked note to the backend regardless (for buzzer feedback)
    await sendNoteToBackend(note);
  }, [gameStarted, noteIndex, currentNotes]);

  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setGameFinished(false);
    setNoteIndex(0);
    setScore(0);
    setMessage(`Follow the sequence to play ${musicName || 'the song'}!`);
  };

  // Playback the song
  const playBackSong = async () => {
    // Play all notes from currentNotes in sequence with a delay
    for (let i = 0; i < currentNotes.length; i++) {
      const note = currentNotes[i];
      await sendNoteToBackend(note);
      setMessage(`Playing note: ${note}`);
      await new Promise(resolve => setTimeout(resolve, 600)); // small delay between notes
    }
    setMessage("Song playback complete!");
  };

  // Handle keydown events
  const handleKeyDown = useCallback(async (event) => {
    const note = keyToNoteMap[event.keyCode];
    if (note) {
      event.preventDefault(); // Prevent default behavior for mapped keys
      await handleNoteClick(note);
    }
  }, [handleNoteClick, keyToNoteMap]);

  // Add and clean up event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Optional: Log location.state for debugging
  useEffect(() => {
    console.log(location.state);
  }, [location.state]);

  return (
    <Container maxWidth="md">
      <StyledPaper elevation={3}>
        <Box display="flex" flexDirection="column">
          <Box display="flex" alignItems="center" mb={2}>
            <IconButton color="primary" onClick={() => navigate('/')}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" gutterBottom>
              {musicName || "Game Controller"}
            </Typography>
          </Box>

          <Typography variant="subtitle1" gutterBottom>
            Enjoy the Game!
          </Typography>

          <Box my={2}>
            <Button 
              variant="contained" 
              color="success" 
              onClick={startGame} 
              disabled={gameStarted}
            >
              Start Game
            </Button>
          </Box>

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
                  isActive={activeNotes[note]}
                  isCurrent={gameStarted && note === currentNotes[noteIndex]} 
                >
                  {note} <br />
                  Key: {String.fromCharCode(ascii)}
                </NoteButton>
              </Grid>
            ))}
          </Grid>

          {gameStarted && (
            <Box mt={2}>
              <Typography variant="h6">
                Press: <strong>{currentNotes[noteIndex]}</strong>
              </Typography>
            </Box>
          )}

          {/* If the game is finished, show a playback button */}
          {gameFinished && (
            <Box mt={2}>
              <Button variant="contained" color="info" onClick={playBackSong}>
                Play Back Song
              </Button>
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
        <Alert onClose={() => setMessage("")} severity="info" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default GameController;
