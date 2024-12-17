import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import useFetchCompositions from './useFetchCompositions';
import {
  Container,
  Typography,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
  Box,
  Avatar,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  IconButton,
  CssBaseline
} from "@mui/material";
import { Add as AddIcon, PlayArrow as PlayArrowIcon } from "@mui/icons-material";

const HomePage = () => {
  const navigate = useNavigate();
  const [user, loading, error] = useAuthState(auth);
  const { compositions, loading: loadingCompositions, error: fetchError } = useFetchCompositions();

  const handleCreateComposition = () => {
    navigate('/create-composition');
  };

  const getUsername = () => {
    if (user?.displayName) {
      return user.displayName;
    } else if (user?.email) {
      return user.email.split("@")[0];
    } else {
      return "User";
    }
  };

  const handleGamePlay = (composition) => {
    navigate(`/game/${composition.id}`, { 
      state: { 
        musicName: composition.composition_name, 
        uploaderName: composition.user_email, 
        notes: composition.notes 
      } 
    });
  };

  if (loading || loadingCompositions) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || fetchError) {
    return (
      <Container maxWidth="sm">
        <Alert severity="error" sx={{ mt: 4 }}>Error: {error?.message || fetchError?.message}</Alert>
      </Container>
    );
  }

  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" aria-label="add game" onClick={handleCreateComposition} edge="start" sx={{ mr: 2 }}>
            <AddIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Melody Gamification
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body1" sx={{ mr: 2 }}>
              {getUsername()}
            </Typography>
            <Avatar alt={getUsername()} src={user?.photoURL} />
          </Box>
          <Button color="inherit" onClick={() => auth.signOut()} sx={{ ml: 2 }}>Logout</Button>
        </Toolbar>
      </AppBar>
      
      <Container component="main" maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {getUsername()}!
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Choose a game to play or create your own!
        </Typography>
        
        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
          Composed Games:
        </Typography>
        <Grid container spacing={3}>
          {compositions.length > 0 ? (
            compositions.map((composition) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={composition.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div">
                      {composition.composition_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Notes: {composition.notes}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      startIcon={<PlayArrowIcon />}
                      onClick={() => handleGamePlay(composition)}
                      fullWidth
                    >
                      Play
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="body1" color="text.secondary">
                No compositions found. Create your first composition!
              </Typography>
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
};

export default HomePage;

