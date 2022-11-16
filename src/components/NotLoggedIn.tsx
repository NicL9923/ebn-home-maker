import React, { useState } from 'react';
import {
  signInWithRedirect,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { FaGoogle } from 'react-icons/fa';
import { auth } from '../firebase';
import { Box, Button, Divider, FormControl, FormLabel, Heading, Input, Stack, useToast } from '@chakra-ui/react';

const NotLoggedIn = () => {
  const toast = useToast();
  const provider = new GoogleAuthProvider();

  const [email, setEmail] = useState<string | undefined>(undefined);
  const [password, setPassword] = useState<string | undefined>(undefined);

  const googleSignIn = () =>
    signInWithRedirect(auth, provider)
      .then(() => {
        toast({
          title: 'Successfully signed in with Google!',
          status: 'success',
          isClosable: true,
        });
      })
      .catch((error) => {
        toast({
          title: `Error signing in with Google: ${error.message}`,
          status: 'error',
          isClosable: true,
        });
        console.log(error);
      });

  const emailPassSignIn = () => {
    if (email && password)
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          toast({
            title: 'Successfully signed in with email/password!',
            status: 'success',
            isClosable: true,
          });
        })
        .catch((error) => {
          toast({
            title: `Error signing in with email/password: ${error.message}`,
            status: 'error',
            isClosable: true,
          });
          console.log(error);
        });
  };

  const createEmailPassAccount = () => {
    if (!email || !password) return;

    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        // Successfully created & signed in
        toast({
          title: 'Successfully created account!',
          status: 'success',
          isClosable: true,
        });
      })
      .catch((error) => {
        // Error creating account
        toast({
          title: `Error creating email/password account: ${error.message}`,
          status: 'error',
          isClosable: true,
        });
        console.error(error);
      });
  };

  return (
    <Box maxWidth='sm' mx='auto' textAlign='center' mt={8} p={2}>
      <Heading mb={3}>Login</Heading>

      <Stack width='75%' mx='auto'>
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input type='email' value={email} onChange={(event) => setEmail(event.target.value)} />
        </FormControl>

        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input type='password' value={password} onChange={(event) => setPassword(event.target.value)} />
        </FormControl>

        <Stack direction='row' justifyContent='center' spacing={2} mt={3}>
          <Button onClick={emailPassSignIn}>Sign in</Button>
          <Button onClick={createEmailPassAccount}>Create account</Button>
        </Stack>

        <Divider sx={{ mt: 3, mb: 3 }} />

        <Button leftIcon={<FaGoogle />} onClick={googleSignIn}>
          Sign-In with Google
        </Button>
      </Stack>
    </Box>
  );
};

export default NotLoggedIn;
