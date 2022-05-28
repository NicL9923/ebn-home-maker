import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { doc, setDoc } from 'firebase/firestore';
import React, { useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseContext } from '..';
import { UserContext } from '../App';

const NoFamily = () => {
    const { db } = useContext(FirebaseContext);
    const { userId, getProfile, getFamily } = useContext(UserContext);
    
    const [creatingFamily, setCreatingFamily] = useState(false);
    const [newName, setNewName] = useState(null);

    const createFamily = () => {
        const newFamId = uuidv4();
        
        setDoc(doc(db, 'families', newFamId), { name: newName, headOfFamily: userId }).then(() => {
            getFamily();
        });

        setDoc(doc(db, 'profiles', userId), { familyId: newFamId }, { merge: true }).then(() => {
            getProfile();
        });
    };

    return (
    <Stack width='lg' mx='auto'>
        <Typography variant='h5'>It looks like you aren't apart of a family yet!</Typography>
        
        <Stack>
            <Typography variant='h6'>Ask your head-of-household for their invite link</Typography>
            <Typography variant='h6'>OR</Typography>
            <Button variant='contained' onClick={() => setCreatingFamily(true)}>Create a family</Button>
        </Stack>

        <Dialog open={creatingFamily} onClose={() => setCreatingFamily(false)}>
            <DialogTitle>Create Family</DialogTitle>

            <DialogContent>
                <Stack>
                    <TextField
                        autoFocus
                        variant='standard'
                        label='Family (Last) Name'
                        value={newName}
                        onChange={(event) => setNewName(event.target.value)}
                        required
                    />
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={() => setCreatingFamily(false)}>Cancel</Button>
                <Button variant='contained' onClick={createFamily}>Create</Button>
            </DialogActions>
        </Dialog>
    </Stack>
  );
};

export default NoFamily;
