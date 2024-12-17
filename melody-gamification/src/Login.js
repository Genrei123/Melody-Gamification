import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Link,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Email, Lock, Google } from '@mui/icons-material';
import { auth, googleProvider } from './firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4),
}));

const Form = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(1),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
}));

const GoogleButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const Login = ({ onLogin, switchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (error) {
      console.error("Error logging in:", error);
      alert(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      onLogin();
    } catch (error) {
      console.error("Error signing in with Google:", error);
      alert(error.message);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <StyledPaper elevation={6}>
        <Typography component="h1" variant="h5">
          Login to your account
        </Typography>
        <Form onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: <Email color="action" />,
            }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: <Lock color="action" />,
            }}
          />
          <SubmitButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
          >
            Sign In
          </SubmitButton>
        </Form>
        <Divider sx={{ width: '100%', my: 2 }}>Or</Divider>
        <GoogleButton
          fullWidth
          variant="outlined"
          startIcon={<Google />}
          onClick={handleGoogleSignIn}
        >
          Sign in with Google
        </GoogleButton>
        <Typography variant="body2" align="center">
          Don't have an account?{' '}
          <Link component="button" variant="body2" onClick={switchToSignup}>
            Sign Up
          </Link>
        </Typography>
      </StyledPaper>
    </Container>
  );
};

export default Login;

