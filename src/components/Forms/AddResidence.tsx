import React, { useContext, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, InputLabel, TextField } from '@mui/material';
import { DropzoneArea } from 'mui-file-dropzone';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseContext } from '../../Firebase';
import { AppContext, UserContext } from 'App';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

const defNewRes = {
  name: '',
  yearBuilt: '',
  yearPurchased: '',
  maintenanceMarkers: [],
  serviceLogEntries: [],
};

interface AddResidenceProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  getResidences: () => void;
}

const AddResidence = (props: AddResidenceProps) => {
  const { setSnackbarData } = useContext(AppContext);
  const firebase = useContext(FirebaseContext);
  const { profile, family, getFamily } = useContext(UserContext);
  const { isOpen, setIsOpen, getResidences } = props;
  const [newResidence, setNewResidence] = useState(defNewRes);
  const [newResImgFile, setNewResImgFile] = useState<File | null>(null);

  const addNewResidence = () => {
    if (!family || !profile) return;

    const newResId = uuidv4();

    let newResIdArr: string[] = [];
    if (family.residences) {
      newResIdArr = [...family.residences];
    }
    newResIdArr.push(newResId);

    firebase
      .createResidence(newResId, {
        ...newResidence,
        id: newResId,
      })
      .then(() => {
        firebase
          .updateFamily(profile.familyId, {
            residences: newResIdArr,
          })
          .then(() => {
            getFamily();
            setIsOpen(false);
            setNewResidence(defNewRes);
            setSnackbarData({ msg: 'Successfully added residence!', severity: 'success' });
          });
      });

    if (newResImgFile) {
      const storage = getStorage();
      const imgRef = ref(storage, uuidv4());
      uploadBytes(imgRef, newResImgFile).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          firebase.updateResidence(newResId, { img: url }).then(() => {
            getResidences();
            setNewResImgFile(null);
          });
        });
      });
    }
  };

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} fullWidth>
      <DialogTitle>Add Residence</DialogTitle>

      <DialogContent>
        <TextField
          autoFocus
          variant='standard'
          label='Name'
          placeholder='My House!'
          value={newResidence.name}
          onChange={(event) => setNewResidence({ ...newResidence, name: event.target.value })}
        />

        <InputLabel>Upload Photo</InputLabel>
        <DropzoneArea
          acceptedFiles={['image/jpeg', 'image/png']}
          filesLimit={1}
          onChange={(files) => setNewResImgFile(files[0])}
          fileObjects={[]}
        />

        <TextField
          variant='standard'
          label='Year Built'
          value={newResidence.yearBuilt}
          onChange={(event) =>
            setNewResidence({
              ...newResidence,
              yearBuilt: event.target.value,
            })
          }
        />

        <TextField
          variant='standard'
          label='Year Purchased'
          value={newResidence.yearPurchased}
          onChange={(event) =>
            setNewResidence({
              ...newResidence,
              yearPurchased: event.target.value,
            })
          }
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setIsOpen(false)}>Cancel</Button>
        <Button variant='contained' onClick={addNewResidence}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddResidence;
