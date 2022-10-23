import React, { useContext, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, InputLabel, TextField } from '@mui/material';
import { DropzoneArea } from 'mui-file-dropzone';
import { v4 as uuidv4 } from 'uuid';
import { UserContext, AppContext } from 'providers/AppProvider';
import { FirebaseContext } from 'providers/FirebaseProvider';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

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
  getVehicles: () => void;
}

const AddVehicle = (props: AddVehicleProps) => {
  const { setSnackbarData } = useContext(AppContext);
  const firebase = useContext(FirebaseContext);
  const { profile, family, getFamily } = useContext(UserContext);
  const { isOpen, setIsOpen, getVehicles } = props;
  const [newVehicle, setNewVehicle] = useState(defNewVeh);
  const [newVehImgFile, setNewVehImgFile] = useState<File | null>(null);

  const addNewVehicle = () => {
    if (!family || !profile) return;

    const newVehId = uuidv4();

    let newVehIdArr: string[] = [];
    if (family.vehicles) {
      newVehIdArr = [...family.vehicles];
    }
    newVehIdArr.push(newVehId);

    firebase.createVehicle(newVehId, { ...newVehicle, id: newVehId }).then(() => {
      firebase
        .updateFamily(profile.familyId, {
          vehicles: newVehIdArr,
        })
        .then(() => {
          getFamily();
          setIsOpen(false);
          setNewVehicle(defNewVeh);
          setSnackbarData({ msg: 'Successfully added vehicle!', severity: 'success' });
        });
    });

    if (newVehImgFile) {
      const storage = getStorage();
      const imgRef = ref(storage, uuidv4());
      uploadBytes(imgRef, newVehImgFile).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          firebase.updateVehicle(newVehId, { img: url }).then(() => {
            getVehicles();
            setNewVehImgFile(null);
          });
        });
      });
    }
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
