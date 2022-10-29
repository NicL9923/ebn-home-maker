import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, InputLabel, TextField } from '@mui/material';
import { DropzoneArea } from 'mui-file-dropzone';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { useAppStore } from 'state/AppStore';
import { useUserStore } from 'state/UserStore';

interface AddPetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AddPet = (props: AddPetProps) => {
  const { isOpen, setIsOpen } = props;

  const firebase = useAppStore((state) => state.firebase);
  const setSnackbarData = useAppStore((state) => state.setSnackbarData);
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);
  const getFamily = useUserStore((state) => state.getFamily);

  const [newName, setNewName] = useState<string | undefined>(undefined);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);

  const addPet = () => {
    if (!profile || !family || !newName) return;

    const newPetsArr = family.pets ? [...family.pets] : [];

    if (newPhoto) {
      const storage = getStorage();
      const imgRef = ref(storage, uuidv4());
      uploadBytes(imgRef, newPhoto).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          newPetsArr.push({ name: newName, imgLink: url });
          firebase.updateFamily(profile.familyId, { pets: newPetsArr }).then(() => {
            getFamily();
            setIsOpen(false);
            setSnackbarData({ msg: 'Successfully added pet!', severity: 'success' });
          });
        });
      });
    } else {
      newPetsArr.push({ name: newName });
      firebase.updateFamily(profile.familyId, { pets: newPetsArr }).then(() => {
        getFamily();
        setIsOpen(false);
        setSnackbarData({ msg: 'Successfully added pet!', severity: 'success' });
      });
    }
  };

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} fullWidth>
      <DialogTitle>Add Pet</DialogTitle>

      <DialogContent>
        <TextField
          autoFocus
          variant='standard'
          label='Name'
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          required
        />

        <InputLabel sx={{ mt: 3 }}>Upload Photo</InputLabel>
        <DropzoneArea
          acceptedFiles={['image/jpeg', 'image/png']}
          filesLimit={1}
          onChange={(files) => setNewPhoto(files[0])}
          fileObjects={[]}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setIsOpen(false)}>Cancel</Button>
        <Button variant='contained' onClick={addPet}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPet;
