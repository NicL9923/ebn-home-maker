import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Paper, Stack, TextField, Typography } from '@mui/material';
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
        const newFamObj = {
            name: newName,
            headOfFamily: userId,
            boardMarkdown: 'This is the family board!',
            events: {
                title: 'Created family on Our Home!',
                start: Date.now(),
                end: Date.now(),
                allDay: true
            }
        };
        
        setDoc(doc(db, 'families', newFamId), newFamObj).then(() => {
            getFamily();
        });

        setDoc(doc(db, 'profiles', userId), { familyId: newFamId }, { merge: true }).then(() => {
            getProfile();
        });
    };

    return (
    <Box maxWidth='sm' mx='auto' mt={3}>
        <Paper sx={{ p: 2 }}>
            <Typography variant='h5' mb={3}>We couldn't find a family for this profile!</Typography>
            
            <Typography variant='h6' textAlign='center'>Ask your head-of-household for their family invite link</Typography>
            <Divider sx={{ width: 250, mx: 'auto', mt: 2, mb: 2 }}>OR</Divider>
            <Stack direction='row' justifyContent='center'>
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
        </Paper>
    </Box>
  );
};

export default NoFamily;
