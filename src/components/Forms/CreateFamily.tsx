import React, { useContext, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { Family } from 'models/types';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseContext } from '../../Firebase';
import { UserContext } from 'App';

interface CreateFamilyProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const CreateFamily = (props: CreateFamilyProps) => {
  const firebase = useContext(FirebaseContext);
  const { userId, getProfile, getFamily } = useContext(UserContext);
  const { isOpen, setIsOpen } = props;
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
      groceryList: [],
    };

    firebase.createFamily(newFamId, newFamObj).then(() => {
      getFamily();
    });

    firebase.updateProfile(userId, { familyId: newFamId }).then(() => {
      getProfile();
    });

    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} fullWidth>
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
        <Button onClick={() => setIsOpen(false)}>Cancel</Button>
        <Button variant='contained' onClick={createFamily}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateFamily;
