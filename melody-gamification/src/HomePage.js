import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import Masonry from "react-masonry-css";
import {
  Container,
  Typography,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
  Box,
  Avatar,
  InputBase,
  IconButton,
  Button,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { 
  Search as SearchIcon, 
  Add as AddIcon, 
  PlayArrow as PlayArrowIcon 
} from "@mui/icons-material";

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
}));

const NavBar = styled(AppBar)(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1100,
}));

const MainContent = styled(Box)(({ theme }) => ({
  marginTop: `calc(64px + ${theme.spacing(4)})`, 
  padding: theme.spacing(2),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: theme.shadows[10],
  },
}));

const PlayButton = styled(Button)(({ theme }) => ({
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.1)",
    boxShadow: `0 0 15px ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.primary.light,
  },
}));

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

const StyledMasonry = styled(Masonry)(({ theme }) => ({
  display: "flex",
  marginLeft: theme.spacing(-2),
  width: "auto",
}));

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, loading, error] = useAuthState(auth);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreateComposition = () => {
    navigate('/create-composition');
  };
  // Sample data for games
  const games = [
    { id: 1, musicName: "Jingle Bells", uploaderName: "Alice", difficulty: "Easy" },
    { id: 2, musicName: "Silent Night", uploaderName: "Bob", difficulty: "Medium" },
    { id: 3, musicName: "Deck the Halls", uploaderName: "Charlie", difficulty: "Hard" },
    { id: 4, musicName: "Frosty the Snowman", uploaderName: "David", difficulty: "Easy" },
    { id: 5, musicName: "All I Want for Christmas Is You", uploaderName: "Eve", difficulty: "Medium" },
    { id: 6, musicName: "Let It Snow", uploaderName: "Frank", difficulty: "Hard" },
  ];

  const getUsername = (): string => {
    if (user?.displayName) {
      return user.displayName;
    } else if (user?.email) {
      return user.email.split("@")[0];
    } else {
      return "User";
    }
  };

  const handleGamePlay = (gameId: number) => {
    // Navigate to the specific game page
    navigate(`/game/${gameId}`);
  };

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer>
        <Alert severity="error">Error: {error.message}</Alert>
      </StyledContainer>
    );
  }

  return (
    <>
      <NavBar>
        <Toolbar>
        <IconButton color="inherit" aria-label="add game" onClick={handleCreateComposition}>
            <AddIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Melody Gamification
          </Typography>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search games…"
              inputProps={{ "aria-label": "search" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Search>
          <IconButton color="inherit" aria-label="add game">
            <AddIcon />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
            <Typography variant="body1" sx={{ mr: 2 }}>
              {getUsername()}
            </Typography>
            <Avatar alt={getUsername()} src={user?.photoURL} />
          </Box>
        </Toolbar>
      </NavBar>
      
      <MainContent>
        <StyledContainer>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome, {getUsername()}!
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Choose a game to play or create your own!
          </Typography>
          <Box my={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateComposition}
            >
              Create New Composition
            </Button>
          </Box>
          <StyledMasonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {games.map((game) => (
              <StyledCard key={game.id}>
                <CardContent>
                  <Typography variant="h5" component="div">
                    {game.musicName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uploaded by: {game.uploaderName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Difficulty: {game.difficulty}
                  </Typography>
                </CardContent>
                <CardActions>
                  <PlayButton 
                    variant="contained" 
                    color="primary" 
                    startIcon={<PlayArrowIcon />}
                    onClick={() => handleGamePlay(game.id)}
                  >
                    Play
                  </PlayButton>
                </CardActions>
              </StyledCard>
            ))}
          </StyledMasonry>
        </StyledContainer>
      </MainContent>
    </>
  );
};

export default HomePage;