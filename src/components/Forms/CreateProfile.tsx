import React, { useContext, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, InputLabel, TextField } from '@mui/material';
import { DropzoneArea } from 'mui-file-dropzone';
import { UserContext, AppContext } from 'providers/AppProvider';
import { FirebaseContext } from 'providers/FirebaseProvider';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

interface CreateProfileProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const CreateProfile = (props: CreateProfileProps) => {
  const { setSnackbarData } = useContext(AppContext);
  const firebase = useContext(FirebaseContext);
  const { userId, getProfile } = useContext(UserContext);
  const { isOpen, setIsOpen } = props;

  const [newName, setNewName] = useState<string | undefined>(undefined);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);

  // TODO: Replace this w/ new validation
  const isNameValid = (): boolean => {
    if (!newName) {
      setNameError('You must input a name!');
      return false;
    } else if (newName.includes(' ')) {
      setNameError('The name cannot contain spaces!');
      return false;
    } else {
      setNameError(undefined);
      return true;
    }
  };

  const createProfile = () => {
    if (!isNameValid() || !userId || !newName) return;

    const newProfileObj = { firstName: newName, familyId: '' };

    if (newPhoto) {
      const storage = getStorage();
      const imgRef = ref(storage, uuidv4());
      uploadBytes(imgRef, newPhoto).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          firebase
            .createProfile(userId, {
              ...newProfileObj,
              imgLink: url,
            })
            .then(() => {
              getProfile();
              setIsOpen(false);
            });
        });
      });
    } else {
      firebase.createProfile(userId, newProfileObj).then(() => {
        getProfile();
        setIsOpen(false);
        setSnackbarData({ msg: 'Successfully created profile!', severity: 'success' });
      });
    }
  };

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} fullWidth>
      <DialogTitle>Create Profile</DialogTitle>

      <DialogContent>
        <TextField
          autoFocus
          variant='standard'
          label='First Name'
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
        <Button variant='contained' onClick={createProfile}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProfile;
