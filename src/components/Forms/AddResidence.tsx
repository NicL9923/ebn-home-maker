import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, InputLabel, TextField } from '@mui/material';
import { DropzoneArea } from 'mui-file-dropzone';
import { v4 as uuidv4 } from 'uuid';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useUserStore } from 'state/UserStore';
import { db, FsCol, storage } from '../../firebase';
import { doc, writeBatch } from 'firebase/firestore';
import { useFirestoreWriteBatch } from '@react-query-firebase/firestore';
import { useToast } from '@chakra-ui/react';

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
}

const AddResidence = ({ isOpen, setIsOpen }: AddResidenceProps) => {
  const toast = useToast();
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const [newResidence, setNewResidence] = useState(defNewRes);
  const [newResImgFile, setNewResImgFile] = useState<File | null>(null);

  const batch = writeBatch(db);
  const batchMutation = useFirestoreWriteBatch(batch);

  const addNewResidence = async () => {
    if (!family || !profile) return;

    const newResId = uuidv4();

    let newResIdArr: string[] = [];
    if (family.residences) {
      newResIdArr = [...family.residences];
    }
    newResIdArr.push(newResId);

    let imgUrl: string | undefined = undefined;
    if (newResImgFile) {
      imgUrl = await getDownloadURL((await uploadBytes(ref(storage, uuidv4()), newResImgFile)).ref);
    }

    batch.set(doc(db, FsCol.Residences, newResId), {
      ...newResidence,
      id: newResId,
      img: imgUrl,
    });
    batch.update(doc(db, FsCol.Families, profile.familyId), {
      residences: newResIdArr,
    });

    batchMutation.mutate(undefined, {
      onSuccess() {
        setNewResImgFile(null);
        setNewResidence(defNewRes);
        toast({
          title: 'Successfully added residence!',
          status: 'success',
          isClosable: true,
        });
      },
    });

    setIsOpen(false);
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
