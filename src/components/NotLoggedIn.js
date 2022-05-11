import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { signInWithRedirect, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const NotLoggedIn = (props) => {
    const { auth } = props;
    const provider = new GoogleAuthProvider();

    const [signingIn, setSigningIn] = useState(false);
    const [creatingAcct, setCreatingAcct] = useState(false);
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    
    const googleSignIn = () => signInWithRedirect(auth, provider);

    const emailPassSignIn = () => signInWithEmailAndPassword(auth, email, password);

    const createEmailPassAccount = () => {
        createUserWithEmailAndPassword(auth, email, password).then(() => {
            // Successfully created & signed in
        }).catch(error => {
            // Error creating account
            console.error(error);
        });
    };

    return (
        <Stack width='md' mx='auto'>
            <Typography variant='h5'>You aren't logged in!</Typography>

            <Stack>
                <Button variant='contained' onClick={() => setSigningIn(true)}>Sign in</Button>
                <Dialog open={signingIn} onClose={() => setSigningIn(false)}>
                    <DialogTitle>Sign In</DialogTitle>

                    <DialogContent>
                        <Stack>
                            <TextField
                                autoFocus
                                variant='standard'
                                type='email'
                                label='Email'
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />

                            <TextField
                                autoFocus
                                variant='standard'
                                type='password'
                                label='Password'
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />
                        </Stack>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => setSigningIn(false)}>Cancel</Button>
                        <Button variant='contained' onClick={emailPassSignIn}>Sign In</Button>
                    </DialogActions>
                </Dialog>

                <Button variant='outlined' onClick={() => setCreatingAcct(true)}>Create account</Button>
                <Dialog open={creatingAcct} onClose={() => setCreatingAcct(false)}>
                    <DialogTitle>Create Account</DialogTitle>

                    <DialogContent>
                        <Stack>
                            <TextField
                                autoFocus
                                variant='standard'
                                type='email'
                                label='Email'
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />

                            <TextField
                                autoFocus
                                variant='standard'
                                type='password'
                                label='Password'
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />
                        </Stack>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => setCreatingAcct(false)}>Cancel</Button>
                        <Button variant='contained' onClick={createEmailPassAccount}>Create</Button>
                    </DialogActions>
                </Dialog>

                <Typography variant='h6'>OR</Typography>
                <Button variant='contained' onClick={googleSignIn}>Google Sign-In</Button>
            </Stack>
        </Stack>
    );
};

export default NotLoggedIn;
