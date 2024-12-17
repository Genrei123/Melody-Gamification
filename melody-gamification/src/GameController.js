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
  Paper,
  CssBaseline,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, MusicNote as MusicNoteIcon } from '@mui/icons-material';
import { JINGLE_BELLS, NOTES } from './constants';

const GameController = () => {
  const { gameId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { musicName, uploaderName, notes } = location.state || {};

  const [gameState, setGameState] = useState({
    started: false,
    finished: false,
    noteIndex: 0,
    score: 0,
  });
  const [message, setMessage] = useState("");
  const [activeNotes, setActiveNotes] = useState({});

  const currentNotes = notes ? notes.split(',') : JINGLE_BELLS.split(',');

  const keyToNoteMap = Object.fromEntries(NOTES.map(({ note, ascii }) => [ascii, note]));

  const sendNoteToBackend = async (note) => {
    try {
      const response = await Promise.race([
        fetch("http://localhost:5000/send-note", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note }),
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 1000))
      ]);
      console.log(`Sent note to backend: ${note}`);
    } catch (error) {
      console.error("Error communicating with backend:", error);
      setMessage("Failed to send note. Check connection.");
    }
  };

  const handleNoteClick = useCallback(async (note) => {
    if (!gameState.started) {
      setMessage("Start the game first!");
      return;
    }
  
    const correctNote = currentNotes[gameState.noteIndex];
  
    setActiveNotes(prev => ({ ...prev, [note]: true }));
    setTimeout(() => setActiveNotes(prev => ({ ...prev, [note]: false })), 200);

    setGameState(prev => ({
      ...prev,
      noteIndex: note === correctNote ? prev.noteIndex + 1 : prev.noteIndex,
      score: note === correctNote ? prev.score + 1 : prev.score,
      finished: note === correctNote && prev.noteIndex + 1 >= currentNotes.length,
      started: note === correctNote && prev.noteIndex + 1 >= currentNotes.length ? false : prev.started,
    }));

    setMessage(note === correctNote 
      ? gameState.noteIndex + 1 >= currentNotes.length 
        ? "Congratulations! You played the song!" 
        : "Correct!" 
      : `Wrong note! Expected "${correctNote}". Try again.`);

    await sendNoteToBackend(note);
  }, [gameState, currentNotes]);

  const startGame = () => {
    setGameState({
      started: true,
      finished: false,
      noteIndex: 0,
      score: 0,
    });
    setMessage(`Follow the sequence to play ${musicName || 'the song'}!`);
  };

  const playBackSong = async () => {
    for (let note of currentNotes) {
      await sendNoteToBackend(note);
      setMessage(`Playing note: ${note}`);
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    setMessage("Song playback complete!");
  };

  const handleKeyDown = useCallback(async (event) => {
    const note = keyToNoteMap[event.keyCode];
    if (note) {
      event.preventDefault();
      await handleNoteClick(note);
    }
  }, [handleNoteClick, keyToNoteMap]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    console.log(location.state);
  }, [location.state]);

  return (
    <>
      <CssBaseline />
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
          <Box display="flex" flexDirection="column">
            <Box display="flex" alignItems="center" mb={2}>
              <IconButton color="primary" onClick={() => navigate('/')} sx={{ mr: 2 }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4" component="h1">
                {musicName || "Game Controller"}
              </Typography>
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              Enjoy the Game!
            </Typography>

            <Box my={2} display="flex" justifyContent="space-between" alignItems="center">
              <Button 
                variant="contained" 
                color="primary" 
                onClick={startGame} 
                disabled={gameState.started}
                startIcon={<MusicNoteIcon />}
              >
                Start Game
              </Button>
              <Typography variant="h6">
                Score: {gameState.score} / {currentNotes.length}
              </Typography>
            </Box>

            <Grid container spacing={2} justifyContent="center">
              {NOTES.map(({ note, ascii }) => (
                <Grid item key={note}>
                  <Button
                    variant="outlined"
                    onClick={() => handleNoteClick(note)}
                    sx={{
                      minWidth: '100px',
                      backgroundColor: gameState.started && note === currentNotes[gameState.noteIndex] 
                        ? 'secondary.light'
                        : activeNotes[note] 
                          ? 'primary.light' 
                          : 'inherit',
                      color: gameState.started && note === currentNotes[gameState.noteIndex] 
                        ? 'common.white' 
                        : 'text.primary',
                      fontWeight: gameState.started && note === currentNotes[gameState.noteIndex] ? 'bold' : 'normal',
                      transition: 'background-color 0.2s, transform 0.1s',
                      '&:active': {
                        transform: 'scale(0.95)',
                      },
                    }}
                  >
                    {note} <br />
                    Key: {String.fromCharCode(ascii)}
                  </Button>
                </Grid>
              ))}
            </Grid>

            {gameState.started && (
              <Box mt={2}>
                <Typography variant="h6">
                  Press: <strong>{currentNotes[gameState.noteIndex]}</strong>
                </Typography>
              </Box>
            )}

            {gameState.finished && (
              <Box mt={2}>
                <Button variant="contained" color="secondary" onClick={playBackSong}>
                  Play Back Song
                </Button>
              </Box>
            )}
          </Box>
        </Paper>

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
    </>
  );
};

export default GameController;

