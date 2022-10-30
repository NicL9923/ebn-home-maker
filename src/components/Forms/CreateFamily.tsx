import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { Family } from 'models/types';
import { v4 as uuidv4 } from 'uuid';
import { useAppStore } from 'state/AppStore';
import { useUserStore } from 'state/UserStore';
import { doc, writeBatch } from 'firebase/firestore';
import { useFirestoreWriteBatch } from '@react-query-firebase/firestore';
import { db, FsCol } from '../../firebase';

interface CreateFamilyProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const CreateFamily = ({ isOpen, setIsOpen }: CreateFamilyProps) => {
  const [newName, setNewName] = useState<string | undefined>(undefined);

  const setSnackbarData = useAppStore((state) => state.setSnackbarData);
  const userId = useUserStore((state) => state.userId);

  const batch = writeBatch(db);
  const batchMutation = useFirestoreWriteBatch(batch);

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
      cityState: 'Seattle,WA', // This'll be the default, because why not!
    };

    batch.set(doc(db, FsCol.Families, newFamId), newFamObj);
    batch.update(doc(db, FsCol.Profiles, userId), { familyId: newFamId });

    batchMutation.mutate(undefined, {
      onSuccess() {
        setSnackbarData({ msg: 'Successfully created family!', severity: 'success' });
      },
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
