import {
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import React, { useContext, useState } from 'react';
import {
  signInWithRedirect,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { Google } from '@mui/icons-material';
import { FirebaseContext } from '../Firebase';

const NotLoggedIn = (): JSX.Element => {
  const { auth } = useContext(FirebaseContext);
  const provider = new GoogleAuthProvider();

  const [email, setEmail] = useState<string | undefined>(undefined);
  const [password, setPassword] = useState<string | undefined>(undefined);

  const googleSignIn = () => signInWithRedirect(auth, provider);

  const emailPassSignIn = () => {
    if (email && password) signInWithEmailAndPassword(auth, email, password);
  };

  const createEmailPassAccount = () => {
    if (!email || !password) return;

    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        // Successfully created & signed in
      })
      .catch((error) => {
        // Error creating account
        console.error(error);
      });
  };

  return (
    <Box maxWidth="sm" mx="auto" textAlign="center" mt={8}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h3" mb={3}>
          Login
        </Typography>

        <Stack width="75%" mx="auto">
          <TextField
            autoFocus
            variant="standard"
            type="email"
            label="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <TextField
            variant="standard"
            type="password"
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <Stack direction="row" justifyContent="center" spacing={2} mt={3}>
            <Button variant="contained" onClick={emailPassSignIn}>
              Sign in
            </Button>
            <Button variant="outlined" onClick={createEmailPassAccount}>
              Create account
            </Button>
          </Stack>

          <Divider sx={{ mt: 3, mb: 3 }}>OR</Divider>

          <Button
            variant="contained"
            startIcon={<Google />}
            onClick={googleSignIn}
          >
            Sign-In with Google
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default NotLoggedIn;
