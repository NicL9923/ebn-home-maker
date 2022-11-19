import { Button, FormControl, FormErrorMessage, FormLabel, Input, Stack, useToast } from '@chakra-ui/react';
import { auth } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { BaseSyntheticEvent } from 'react';

// TODO: Email validation - required to create profile ?

const createAccountValidationSchema = yup
  .object({
    email: yup.string().email().required('Email is required'),
    password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    passwordConfirmation: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match'),
  })
  .required();

interface CreateAccountSchema {
  email: string;
  password: string;
  passwordConfirmation: string;
}

const CreateAccount = () => {
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAccountSchema>({
    resolver: yupResolver(createAccountValidationSchema),
  });

  const createEmailPassAccount = (createAccountData: CreateAccountSchema, event?: BaseSyntheticEvent) => {
    event?.preventDefault();

    createUserWithEmailAndPassword(auth, createAccountData.email, createAccountData.password)
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
          title: `Error creating email/password account`,
          description: error.message,
          status: 'error',
          isClosable: true,
        });
      });
  };

  return (
    <Stack width='75%' mx='auto'>
      <form onSubmit={handleSubmit(createEmailPassAccount)} method='post'>
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

        <FormControl isInvalid={!!errors.passwordConfirmation?.message}>
          <FormLabel>Confirm password</FormLabel>
          <Input type='password' {...register('passwordConfirmation')} />
          <FormErrorMessage>{errors.passwordConfirmation?.message}</FormErrorMessage>
        </FormControl>

        <Stack direction='row' justifyContent='center' spacing={2} mt={3}>
          <Button type='submit'>Create account</Button>
        </Stack>
      </form>
    </Stack>
  );
};

export default CreateAccount;
