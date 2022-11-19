import React, { useState } from 'react';
import { Box, Button, Heading, Text } from '@chakra-ui/react';
import Login from './Forms/Login';
import CreateAccount from './Forms/CreateAccount';

const NotLoggedIn = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(true);

  return (
    <Box maxWidth='sm' mx='auto' textAlign='center' mt={8} p={2}>
      <Heading mb={3}>{isLoggingIn ? 'Login' : 'Sign Up'}</Heading>

      {isLoggingIn ? (
        <Text m={3}>
          Don&apos;t have an account yet?{' '}
          <Button variant='link' onClick={() => setIsLoggingIn(false)}>
            Create one
          </Button>
        </Text>
      ) : (
        <Text m={3}>
          Already have an account?{' '}
          <Button variant='link' onClick={() => setIsLoggingIn(true)}>
            Login
          </Button>
        </Text>
      )}

      {isLoggingIn ? <Login /> : <CreateAccount />}
    </Box>
  );
};

export default NotLoggedIn;
