import { Box, Button, Heading, Text } from '@chakra-ui/react';
import React from 'react';
import LoginForm from '../src/components/Forms/LoginForm';
import Link from 'next/link';
import { useUserStore } from '../src/state/UserStore';
import { AlreadySignedIn } from './signup';

const Login = () => {
  const userId = useUserStore((state) => state.userId);

  return (
    <Box maxWidth='sm' mx='auto' textAlign='center' mt={8} p={2}>
      <Heading mb={3}>Login</Heading>

      {!userId ? (
        <Text m={3}>
          Don&apos;t have an account yet?{' '}
          <Link href='/signup'>
            <Button variant='link'>Create one</Button>
          </Link>
        </Text>
      ) : (
        <AlreadySignedIn />
      )}

      <LoginForm />
    </Box>
  );
};

export default Login;
