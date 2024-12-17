import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Paper, 
  Box,
  TextField,
  Snackbar,
  Alert,
  IconButton,
  Chip,
  InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UndoIcon from '@mui/icons-material/Undo';
import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { NOTES } from './constants';
import { auth } from './firebase';
import axios from 'axios';

const BACKEND_URL = 'https://aliceblue-marten-295174.hostingersite.com/save_compositions.php';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  marginTop: theme.spacing(4),
}));

const CreateComposition = () => {
  const navigate = useNavigate();
  const [composition, setComposition] = useState([]);
  const [compositionName, setCompositionName] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');

  const handleBackToHomepage = () => {
    if (composition.length > 0) {
      const confirmLeave = window.confirm(
        "Are you sure you want to leave? Your current composition will be lost."
      );
      
      if (confirmLeave) {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  const handleNoteAdd = (note) => {
    setComposition(prev => [...prev, note]);
  };

  const handleUndo = () => {
    setComposition(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setComposition([]);
  };

  const currentUser = auth.currentUser;

// In CreateComposition.js, modify the axios call
const handleSaveComposition = async () => {
  try {
    const response = await axios.post(
      BACKEND_URL, 
      {
        compositionName,
        composition: composition.join(','),
        userEmail: currentUser.email
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    // Handle successful response
    if (response.data.status === 'success') {
      // Show success message
      setMessage('Composition saved successfully!');
      setSeverity('success');
      
      // Navigate back to homepage after a short delay
      setTimeout(() => {
        navigate('/');
      }, 1000); // 1 second delay to show the success message
    } else {
      setMessage(response.data.message || 'Error saving composition');
      setSeverity('error');
    }
  } catch (error) {
    console.error('FULL ERROR DETAILS:', error);

    setMessage(`Connection Error: ${error.message}`);
    setSeverity('error');
  }
};

  return (
    <Container maxWidth="md">
      <StyledPaper elevation={3}>
        {/* Back Button and Title Container */}
        <Box display="flex" alignItems="center" mb={2}>
          <IconButton 
            color="primary" 
            onClick={handleBackToHomepage}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" gutterBottom>
            Create Your Composition
          </Typography>
        </Box>

        {/* Composition Name Input */}
        <Box my={2}>
          <TextField
            fullWidth
            label="Composition Name"
            variant="outlined"
            value={compositionName}
            onChange={(e) => setCompositionName(e.target.value)}
            placeholder="Enter a name for your composition"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MusicNoteIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Current Composition Display */}
        <Box 
          my={2} 
          p={2} 
          border={1} 
          borderColor="grey.300" 
          borderRadius={2}
        >
          <Typography variant="h6" color="textSecondary">
            Current Composition:
          </Typography>
          <Typography variant="body1" sx={{ 
            fontFamily: 'monospace', 
            overflowX: 'auto', 
            whiteSpace: 'nowrap' 
          }}>
            {composition.length > 0 
              ? composition.map((note, index) => (
                  <Chip 
                    key={index} 
                    label={note} 
                    color="primary" 
                    variant="outlined" 
                    sx={{ m: 0.5 }} 
                  />
                ))
              : "No notes added yet"
            }
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box my={2} display="flex" justifyContent="center" gap={2}>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleUndo}
            disabled={composition.length === 0}
            startIcon={<UndoIcon />}
          >
            Undo
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleClear}
            disabled={composition.length === 0}
            startIcon={<ClearIcon />}
          >
            Clear
          </Button>
        </Box>

        {/* Notes Grid */}
        <Grid 
          container 
          spacing={2} 
          justifyContent="center" 
          alignItems="center"
        >
          {NOTES.map(({ note, ascii }) => (
            <Grid item key={note}>
              <Button
                variant="outlined"
                onClick={() => handleNoteAdd(note)}
                sx={{ 
                  margin: 1, 
                  minWidth: '80px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: (theme) => 
                      `0 0 10px ${theme.palette.primary.main}`
                  }
                }}
                color={composition[composition.length - 1] === note 
                  ? 'primary' 
                  : 'inherit'}
              >
                <Box textAlign="center">
                  <Typography variant="subtitle1">{note}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Key: {String.fromCharCode(ascii)}
                  </Typography>
                </Box>
              </Button>
            </Grid>
          ))}
        </Grid>

        {/* Save Composition Button */}
        <Box 
          my={3} 
          display="flex" 
          justifyContent="center"
        >
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveComposition}
            disabled={composition.length === 0 || !compositionName}
            startIcon={<SaveIcon />}
            size="large"
          >
            Save Composition
          </Button>
        </Box>
      </StyledPaper>

      {/* Snackbar for messages */}
      <Snackbar 
          open={!!message} 
          autoHideDuration={6000} 
          onClose={() => setMessage('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setMessage('')} 
            severity={severity} 
            sx={{ width: '100%' }}
            variant="filled"
          >
            {message}
          </Alert>
        </Snackbar>
      </Container>
  );
};

export default CreateComposition;