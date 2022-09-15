import React, { useContext, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, InputLabel, TextField } from '@mui/material';
import { DropzoneArea } from 'mui-file-dropzone';
import { FirebaseContext } from 'Firebase';
import { UserContext } from 'App';

interface AddPetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AddPet = (props: AddPetProps) => {
  const firebase = useContext(FirebaseContext);
  const { userId, getProfile } = useContext(UserContext);
  const { isOpen, setIsOpen } = props;

  const [newName, setNewName] = useState<string | undefined>(undefined);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);

  const addPet = () => {
    setIsOpen(false);
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
          error={!!nameError}
          helperText={nameError}
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
