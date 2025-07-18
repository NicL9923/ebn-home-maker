import { Button, Divider, FormControl, FormErrorMessage, FormLabel, Input, Stack, useToast } from '@chakra-ui/react';
import { auth } from '../../firebase';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { FaGoogle } from 'react-icons/fa';
import { BaseSyntheticEvent, useState } from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from '@tanstack/react-router';

const loginValidationSchema = yup.object({
    email: yup.string().email().required('Email is required'),
    password: yup.string().required('Password is required'),
});

type LoginSchema = yup.InferType<typeof loginValidationSchema>;

const LoginForm = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const provider = new GoogleAuthProvider();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(loginValidationSchema),
    });

    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const emailPassSignIn = async (loginData: LoginSchema, event?: BaseSyntheticEvent) => {
        event?.preventDefault();
        setIsLoggingIn(true);

        try {
            await signInWithEmailAndPassword(auth, loginData.email, loginData.password);

            toast({
                title: 'Successfully signed in with email/password!',
                status: 'success',
                isClosable: true,
            });

            setIsLoggingIn(false);
            navigate({ to: '/' });
        } catch (error: any) {
            toast({
                title: `Error signing in with email/password`,
                description: error.message,
                status: 'error',
                isClosable: true,
            });

            setIsLoggingIn(false);
        }
    };

    const googleSignIn = async () => {
        setIsLoggingIn(true);

        try {
            await signInWithPopup(auth, provider);

            toast({
                title: 'Successfully signed in with Google!',
                status: 'success',
                isClosable: true,
            });

            setIsLoggingIn(false);
            navigate({ to: '/' });
        } catch (error: any) {
            toast({
                title: `Error signing in with Google`,
                description: error.message,
                status: 'error',
                isClosable: true,
            });

            setIsLoggingIn(false);
        }
    };

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
                    <Button type='submit' colorScheme='green' isDisabled={isLoggingIn}>
                        Sign in
                    </Button>
                </Stack>
            </form>

            <Divider sx={{ mt: 3, mb: 3 }} />

            <Button leftIcon={<FaGoogle />} onClick={googleSignIn} isDisabled={isLoggingIn}>
                Sign in with Google
            </Button>
        </Stack>
    );
};

export default LoginForm;
