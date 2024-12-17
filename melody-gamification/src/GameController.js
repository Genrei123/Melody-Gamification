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
}));

const GameController = () => {
  const { gameId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { musicName, uploaderName, notes } = location.state || {};

  const [port, setPort] = useState(null);
  const [writer, setWriter] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [noteIndex, setNoteIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [controllerMode, setControllerMode] = useState(false);
  const [activeNotes, setActiveNotes] = useState({});

  const currentNotes = notes ? notes.split(',') : JINGLE_BELLS;

  const handleNoteClick = useCallback(async (note) => {
    if (!gameStarted) {
      setMessage("Start the game first!");
      return;
    }
  
    const correctNote = currentNotes[noteIndex];
  
    // Optimistically update the UI first
    if (note === correctNote) {
      setNoteIndex((prev) => prev + 1);
      setScore((prev) => prev + 1);
      setMessage("Correct!");
  
      if (noteIndex + 1 >= currentNotes.length) {
        setGameStarted(false);
        setMessage("Congratulations! You played the song!");
      }
    } else {
      setMessage(`Wrong note! Expected "${correctNote}". Try again.`);
    }
  
    try {
      // Send note asynchronously
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
  }, [gameStarted, noteIndex, currentNotes]);
  
  
  

  const startGame = () => {
    setGameStarted(true);
    setNoteIndex(0);
    setScore(0);
    setMessage(`Follow the sequence to play ${musicName || 'the song'}!`);
  };

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
            Uploaded by: {uploaderName || "Unknown"}
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
                  isCurrent={gameStarted && note === currentNotes[noteIndex]} // Highlight the current note
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
        </Box>
      </StyledPaper>

      <Snackbar 
        open={!!message} 
        autoHideDuration={6000} 
        onClose={() => setMessage("")}
      >
        <Alert severity="info">{message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default GameController;
