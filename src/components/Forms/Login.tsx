import { Button, Divider, FormControl, FormErrorMessage, FormLabel, Input, Stack, useToast } from '@chakra-ui/react';
import { auth } from '../../firebase';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithRedirect } from 'firebase/auth';
import { FaGoogle } from 'react-icons/fa';
import { BaseSyntheticEvent } from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

const loginValidationSchema = yup
  .object({
    email: yup.string().email().required('Email is required'),
    password: yup.string().required('Password is required'),
  })
  .required();

interface LoginSchema {
  email: string;
  password: string;
}

const Login = () => {
  const toast = useToast();
  const provider = new GoogleAuthProvider();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: yupResolver(loginValidationSchema),
  });

  const emailPassSignIn = (loginData: LoginSchema, event?: BaseSyntheticEvent) => {
    event?.preventDefault();
    signInWithEmailAndPassword(auth, loginData.email, loginData.password)
      .then(() => {
        toast({
          title: 'Successfully signed in with email/password!',
          status: 'success',
          isClosable: true,
        });
      })
      .catch((error) => {
        toast({
          title: `Error signing in with email/password`,
          description: error.message,
          status: 'error',
          isClosable: true,
        });
      });
  };

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
          title: `Error signing in with Google`,
          description: error.message,
          status: 'error',
          isClosable: true,
        });
      });

  return (
    <Stack width='75%' mx='auto'>
      <form onSubmit={handleSubmit(emailPassSignIn)} method='post'>
        <FormControl isInvalid={!!errors.email?.message}>
          <FormLabel>Email</FormLabel>
          <Input type='email' {...register('email')} />
          <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.password?.message}>
          <FormLabel>Password</FormLabel>
          <Input type='password' {...register('password')} />
          <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
        </FormControl>

        <Stack direction='row' justifyContent='center' spacing={2} mt={3}>
          <Button type='submit'>Sign in</Button>
        </Stack>
      </form>

      <Divider sx={{ mt: 3, mb: 3 }} />

      <Button leftIcon={<FaGoogle />} onClick={googleSignIn}>
        Sign in with Google
      </Button>
    </Stack>
  );
};

export default Login;
