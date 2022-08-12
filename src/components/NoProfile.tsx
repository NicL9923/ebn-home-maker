import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { DropzoneArea } from 'mui-file-dropzone';
import React, { useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseContext } from '../Firebase';
import { UserContext } from '../App';

const NoProfile = (): JSX.Element => {
  const firebase = useContext(FirebaseContext);
  const { userId, getProfile } = useContext(UserContext);

  const [newName, setNewName] = useState<string | undefined>(undefined);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [creatingProfile, setCreatingProfile] = useState(false);

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
            });
        });
      });
    } else {
      firebase.createProfile(userId, newProfileObj).then(() => {
        getProfile();
      });
    }
  };

  return (
    <Box maxWidth='sm' mx='auto' mt={2}>
      <Paper sx={{ p: 2 }}>
        <Typography variant='h5'>Welcome to Our Home!</Typography>
        <Typography variant='h6' mb={2}>
          It looks like you don&apos;t have a profile yet, would you like to create one?
        </Typography>
        <Stack direction='row' justifyContent='center' mb={2}>
          <Button variant='contained' onClick={() => setCreatingProfile(true)}>
            Create a profile
          </Button>
        </Stack>
        <Typography variant='caption'>
          Creating a profile allows you to create/join a budget and opens the door to family/household management!
        </Typography>

        <Dialog open={creatingProfile} onClose={() => setCreatingProfile(false)} fullWidth>
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
            <Button onClick={() => setCreatingProfile(false)}>Cancel</Button>
            <Button variant='contained' onClick={createProfile}>
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default NoProfile;
