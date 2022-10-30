import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, InputLabel, TextField } from '@mui/material';
import { DropzoneArea } from 'mui-file-dropzone';
import { v4 as uuidv4 } from 'uuid';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useAppStore } from 'state/AppStore';
import { useUserStore } from 'state/UserStore';
import { doc, writeBatch } from 'firebase/firestore';
import { db, FsCol, storage } from '../../firebase';
import { useFirestoreWriteBatch } from '@react-query-firebase/firestore';

const defNewVeh = {
  year: '',
  make: '',
  model: '',
  trim: '',
  engine: '',
  vin: '',
  licensePlate: '',
  miles: 0,
  maintenanceMarkers: [],
  serviceLogEntries: [],
};

interface AddVehicleProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AddVehicle = ({ isOpen, setIsOpen }: AddVehicleProps) => {
  const setSnackbarData = useAppStore((state) => state.setSnackbarData);
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const [newVehicle, setNewVehicle] = useState(defNewVeh);
  const [newVehImgFile, setNewVehImgFile] = useState<File | null>(null);

  const batch = writeBatch(db);
  const batchMutation = useFirestoreWriteBatch(batch);

  const addNewVehicle = async () => {
    if (!family || !profile) return;

    const newVehId = uuidv4();

    let newVehIdArr: string[] = [];
    if (family.vehicles) {
      newVehIdArr = [...family.vehicles];
    }
    newVehIdArr.push(newVehId);

    let imgUrl: string | undefined = undefined;
    if (newVehImgFile) {
      imgUrl = await getDownloadURL((await uploadBytes(ref(storage, uuidv4()), newVehImgFile)).ref);
    }

    batch.set(doc(db, FsCol.Vehicles, newVehId), {
      ...newVehicle,
      id: newVehId,
      img: imgUrl,
    });
    batch.update(doc(db, FsCol.Families, profile.familyId), {
      residences: newVehIdArr,
    });

    batchMutation.mutate(undefined, {
      onSuccess() {
        setNewVehImgFile(null);
        setNewVehicle(defNewVeh);
        setSnackbarData({ msg: 'Successfully added residence!', severity: 'success' });
      },
    });

    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
      <DialogTitle>Add Vehicle</DialogTitle>

      <DialogContent>
        <TextField
          autoFocus
          variant='standard'
          label='Model Year'
          value={newVehicle.year}
          onChange={(event) => setNewVehicle({ ...newVehicle, year: event.target.value })}
        />

        <TextField
          variant='standard'
          label='Make'
          placeholder='Chevrolet, Ford, Dodge, Toyota...'
          value={newVehicle.make}
          onChange={(event) => setNewVehicle({ ...newVehicle, make: event.target.value })}
        />

        <TextField
          variant='standard'
          label='Model'
          placeholder='F150, Corolla, Tacoma, Tahoe...'
          value={newVehicle.model}
          onChange={(event) => setNewVehicle({ ...newVehicle, model: event.target.value })}
        />

        <TextField
          variant='standard'
          label='Trim'
          placeholder='SE, Limited...'
          value={newVehicle.trim}
          onChange={(event) => setNewVehicle({ ...newVehicle, trim: event.target.value })}
        />

        <TextField
          variant='standard'
          label='Engine'
          placeholder='3.5L V6...'
          value={newVehicle.engine}
          onChange={(event) => setNewVehicle({ ...newVehicle, engine: event.target.value })}
        />

        <TextField
          variant='standard'
          label='VIN (Vehicle Identification Number)'
          value={newVehicle.vin}
          onChange={(event) => setNewVehicle({ ...newVehicle, vin: event.target.value })}
        />

        <TextField
          variant='standard'
          label='License Plate'
          value={newVehicle.licensePlate}
          onChange={(event) => setNewVehicle({ ...newVehicle, licensePlate: event.target.value })}
        />

        <TextField
          variant='standard'
          label='Odometer (miles)'
          value={newVehicle.miles}
          onChange={(event) =>
            setNewVehicle({
              ...newVehicle,
              miles: parseInt(event.target.value),
            })
          }
        />

        <InputLabel>Upload Photo</InputLabel>
        <DropzoneArea
          acceptedFiles={['image/jpeg', 'image/png']}
          filesLimit={1}
          onChange={(files) => setNewVehImgFile(files[0])}
          fileObjects={[]}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setIsOpen(false)}>Cancel</Button>
        <Button variant='contained' onClick={addNewVehicle}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddVehicle;
