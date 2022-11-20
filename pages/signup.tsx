import React from 'react';
import { Box, Button, Heading, Text } from '@chakra-ui/react';
import Link from 'next/link';
import CreateAccount from '../src/components/Forms/CreateAccount';

const SignUp = () => {
  return (
    <Box maxWidth='sm' mx='auto' textAlign='center' mt={8} p={2}>
      <Heading mb={3}>Sign Up</Heading>

      <Text m={3}>
        Already have an account?{' '}
        <Link href='/login'>
          <Button variant='link'>Login</Button>
        </Link>
      </Text>

      <CreateAccount />
    </Box>
  );
};

export default SignUp;
