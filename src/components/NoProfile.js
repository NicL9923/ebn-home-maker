import { Button, Dialog, DialogActions, DialogContent, DialogTitle, InputLabel, Stack, TextField, Typography } from '@mui/material';
import { doc, setDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { DropzoneArea } from 'mui-file-dropzone';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const NoProfile = (props) => {
  const { db, user, getProfile } = props;
  
  const [newName, setNewName] = useState(null);
  const [nameError, setNameError] = useState(null);
  const [newPhoto, setNewPhoto] = useState(null);
  const [creatingProfile, setCreatingProfile] = useState(false);

  const isNameValid = () => {
      if (!newName) {
          setNameError('You must input a name!');
          return false;
      } else if (newName.includes(' ')) {
          setNameError('The name cannot contain spaces!')
      } else {
          setNameError(null);
          return true;
      }
  };

  const createProfile = () => {
    if (!isNameValid()) return;
    
    if (newPhoto) {
      const storage = getStorage();
      const imgRef = ref(storage, uuidv4());
      uploadBytes(imgRef, newPhoto).then(snapshot => {
          getDownloadURL(snapshot.ref).then(url => { 
            setDoc(doc(db, 'profiles', user.uid), { firstName: newName, imgLink: url }).then(() => {
              getProfile(user.uid);
            });
          });
      });
    } else {
      setDoc(doc(db, 'profiles', user.uid), { firstName: newName }).then(() => {
        getProfile(user.uid);
      });
    }
  };

  return (
    <Stack width='lg' mx='auto'>
      <Typography variant='h6'>You don't have a profile with OurHome yet!</Typography>
      <Button variant='contained' onClick={() => setCreatingProfile(true)}>Create a profile</Button>

      <Dialog open={creatingProfile} onClose={() => setCreatingProfile(false)}>
        <DialogTitle>Create Profile</DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            variant='standard'
            label='First Name'
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            required
            error={nameError}
            helperText={nameError}
          />

          <InputLabel>Upload Photo</InputLabel>
          <DropzoneArea
            acceptedFiles={['image/jpeg', 'image/png']}
            filesLimit={1}
            onChange={(files) => setNewPhoto(files[0])}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setCreatingProfile(false)}>Cancel</Button>
          <Button variant='contained' onClick={createProfile}>Create</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default NoProfile;
