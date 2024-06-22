import { Box, Button, Heading, Text } from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import LoginForm from '../components/Forms/LoginForm';
import { useUserStore } from '../state/UserStore';
import { AlreadySignedIn } from './Signup';

const Login = () => {
  const userId = useUserStore((state) => state.userId);

  return (
    <Box maxWidth='sm' mx='auto' textAlign='center' mt={8} p={2}>
      <Heading mb={3}>Login</Heading>

      {!userId ? (
        <Text m={3}>
          Don&apos;t have an account yet?{' '}
          <Link to='/signup'>
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
