import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import React, { useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseContext } from '../Firebase';
import { UserContext } from '../App';
import { Family } from 'models/types';

const NoFamily = (): JSX.Element => {
  const firebase = useContext(FirebaseContext);
  const { userId, getProfile, getFamily } = useContext(UserContext);

  const [creatingFamily, setCreatingFamily] = useState(false);
  const [newName, setNewName] = useState<string | undefined>(undefined);

  const createFamily = () => {
    if (!userId || !newName) return;

    const newFamId = uuidv4();
    const newFamObj: Family = {
      name: newName,
      headOfFamily: userId,
      members: [userId],
      boardMarkdown: 'This is the family board!',
      pets: [],
      vehicles: [],
      residences: [],
    };

    firebase.createFamily(newFamId, newFamObj).then(() => {
      getFamily();
    });

    firebase.updateProfile(userId, { familyId: newFamId }).then(() => {
      getProfile();
    });
  };

  return (
    <Box maxWidth='sm' mx='auto' mt={3}>
      <Paper sx={{ p: 2 }}>
        <Typography variant='h5' mb={3}>
          We couldn&apos;t find a family for this profile!
        </Typography>

        <Typography variant='h6' textAlign='center'>
          Ask your head-of-household for their family invite link
        </Typography>
        <Divider sx={{ width: 250, mx: 'auto', mt: 2, mb: 2 }}>OR</Divider>
        <Stack direction='row' justifyContent='center'>
          <Button variant='contained' onClick={() => setCreatingFamily(true)}>
            Create a family
          </Button>
        </Stack>

        <Dialog open={creatingFamily} onClose={() => setCreatingFamily(false)} fullWidth>
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
            <Button variant='contained' onClick={createFamily}>
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default NoFamily;
