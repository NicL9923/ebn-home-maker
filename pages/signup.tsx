import React from 'react';
import { Box, Button, Heading, Text } from '@chakra-ui/react';
import Link from 'next/link';
import CreateAccount from '../src/components/Forms/CreateAccount';
import { useUserStore } from '../src/state/UserStore';

const SignUp = () => {
  const userId = useUserStore((state) => state.userId);

  return (
    <Box maxWidth='sm' mx='auto' textAlign='center' mt={8} p={2}>
      <Heading mb={3}>Sign Up</Heading>

      {!userId ? (
        <Text m={3}>
          Already have an account?{' '}
          <Link href='/login'>
            <Button variant='link'>Login</Button>
          </Link>
        </Text>
      ) : (
        <AlreadySignedIn />
      )}

      <CreateAccount />
    </Box>
  );
};

export const AlreadySignedIn = () => {
  return (
    <>
      <Text m={3}>Looks like you&apos;re already signed in!</Text>
      <Link href='/'>
        <Button variant='link'>Go home</Button>
      </Link>
    </>
  );
};

export default SignUp;
