import React, { useContext, useEffect, useState } from 'react';
import { getDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Box, Button, Card, CardActions, CardContent, CardMedia, Container, Dialog, DialogActions, DialogContent, DialogTitle, InputLabel, Paper, Stack, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, DirectionsCar, House } from '@mui/icons-material';
import { FirebaseContext } from '..';
import { UserContext } from '../App';
import { DropzoneArea } from 'mui-file-dropzone';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';


const defNewRes = {
  name: '',
  yearBuilt: '',
  yearPurchased: '',
  maintenanceMarkers: [],
  serviceLogEntries: []
};

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
  serviceLogEntries: []
};

const Maintenance = () => {
  const { db } = useContext(FirebaseContext);
  const { profile, family, getFamily } = useContext(UserContext);
  const [residences, setResidences] = useState(null);
  const [vehicles, setVehicles] = useState(null);
  const [addingResidence, setAddingResidence] = useState(false);
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [newResidence, setNewResidence] = useState(defNewRes);
  const [newResImgFile, setNewResImgFile] = useState(null);
  const [newVehicle, setNewVehicle] = useState(defNewVeh);
  const [newVehImgFile, setNewVehImgFile] = useState(null);

  const getResidences = () => {
    if (!family.residences) return;

    let residencesArr = [];

    family.residences.forEach(residence => {
      getDoc(doc(db, 'residences', residence)).then(resDoc => {
        if (resDoc.exists()) {
          const docData = resDoc.data();
          docData.serviceLogEntries.forEach((entry, index) => {
            entry.date = new Date(entry.date).toLocaleDateString();
            entry.id = index;
          });
          residencesArr.push(docData);
          setResidences(residencesArr);
        } else {
          // No residences found
        }
      });
    });
  };

  const getVehicles = () => {
    if (!family.vehicles) return;

    let vehiclesArr = [];

    family.vehicles.forEach(vehicle => {
      getDoc(doc(db, 'vehicles', vehicle)).then(vehDoc => {
        if (vehDoc.exists()) {
          const docData = vehDoc.data();
          docData.serviceLogEntries.forEach((entry, index) => {
            entry.date = new Date(entry.date).toLocaleDateString();
            entry.id = index;
          });
          vehiclesArr.push(docData);
          setVehicles(vehiclesArr);
        } else {
          // No vehicles found
        }
      });
    });
  };

  const setResidenceLogVisibility = (resKey) => {
    let residenceArr = residences;
    const resIdx = residenceArr.findIndex(res => res.name === resKey);

    residenceArr[resIdx].logShown = !residenceArr[resIdx].logShown;

    setResidences([...residenceArr]);
  };

  const setVehicleLogVisibility = (vehKey) => {
    let vehicleArr = vehicles;
    const vehIdx = vehicleArr.findIndex(veh => veh.vin === vehKey);

    vehicleArr[vehIdx].logShown = !vehicleArr[vehIdx].logShown;

    setVehicles([...vehicleArr]);
  };

  const addNewResidence = () => {
    const newResId = uuidv4();

    let newResIdArr = [];
    if (family.residences) {
      newResIdArr = [...family.residences];
    }
    newResIdArr.push(newResId);

    setDoc(doc(db, 'residences', newResId), { ...newResidence, id: newResId }).then(() => {
      setDoc(doc(db, 'families', profile.familyId), { residences: newResIdArr }, { merge: true }).then(() => {
        getFamily();
        setAddingResidence(false);
        setNewResidence(defNewRes);
      });
    });
    
    if (newResImgFile) {
      const storage = getStorage();
      const imgRef = ref(storage, uuidv4());
      uploadBytes(imgRef, newResImgFile).then(snapshot => {
          getDownloadURL(snapshot.ref).then(url => { 
            setDoc(doc(db, 'residences', newResId), { img: url }, { merge: true }).then(() => {
              getResidences();
              setNewResImgFile(null);
            });
          });
      });
    }
  };

  const addNewVehicle = () => {
    const newVehId = uuidv4();

    let newVehIdArr = [];
    if (family.vehicles) {
      newVehIdArr = [...family.vehicles];
    }
    newVehIdArr.push(newVehId);

    setDoc(doc(db, 'vehicles', newVehId), { ...newVehicle, id: newVehId }).then(() => {
      setDoc(doc(db, 'families', profile.familyId), { vehicles: newVehIdArr }, { merge: true }).then(() => {
        getFamily();
        setAddingVehicle(false);
        setNewVehicle(defNewVeh);
      });
    });
    
    if (newVehImgFile) {
      const storage = getStorage();
      const imgRef = ref(storage, uuidv4());
      uploadBytes(imgRef, newVehImgFile).then(snapshot => {
          getDownloadURL(snapshot.ref).then(url => { 
            setDoc(doc(db, 'vehicles', newVehId), { img: url }, { merge: true }).then(() => {
              getVehicles();
              setNewVehImgFile(null);
            });
          });
      });
    }
  };

  const deleteResidence = (resId) => {
    deleteDoc(doc(db, 'residences', resId)).then(() => {
      const newResIdArr = [...family.residences];
      newResIdArr.splice(newResIdArr.findIndex(res => res.id === resId), 1);

      setDoc(doc(db, 'families', profile.familyId), { residences: newResIdArr }, { merge: true }).then(() => getFamily());
    });
  };

  const deleteVehicle = (vehId) => {
    deleteDoc(doc(db, 'vehicles', vehId)).then(() => {
      const newVehIdArr = [...family.vehicles];
      newVehIdArr.splice(newVehIdArr.findIndex(veh => veh.id === vehId), 1);

      setDoc(doc(db, 'families', profile.familyId), { vehicles: newVehIdArr }, { merge: true }).then(() => getFamily());
    });
  };

  useEffect(() => {
    if (family) {
      getResidences();
      getVehicles();
    }
  }, [family]);

  return (
    <Box maxWidth='lg' mx='auto' mt={2}>
      <Typography variant='h3'>Maintenance</Typography>

      <Box mt={2}>
        <Typography variant='h4'>Residences</Typography>
        { residences && 
          <Stack direction='row'>
            { residences.map(residence =>
              <Card key={residence.name}>
                { residence.img ?
                  <CardMedia component='img' height='250' src={residence.img} />
                  :
                  <Container><House sx={{ fontSize: 200 }} /></Container>
                }
                <CardContent>
                  <Typography variant='h5'>{residence.name}</Typography>
                  <Typography variant='body1'>Built: {residence.yearBuilt}</Typography>
                  <Typography variant='body1'>Purchased: {residence.yearPurchased}</Typography>

                  { residence.logShown && 
                    <Stack height={300}>
                      <DataGrid
                        columns={[{ field: 'date', headerName: 'Date' }, { field: 'note', headerName: 'Note' }]}
                        rows={residence.serviceLogEntries}
                        pageSize={5}
                        rowsPerPageOptions={[5, 10, 20]}
                      />
                      <Button variant='contained' startIcon={<Add />}>Add log item</Button>
                    </Stack>
                  }
                </CardContent>
                <CardActions>
                  <Button variant='contained' onClick={() => setResidenceLogVisibility(residence.name)}>{residence.logShown ? 'Hide' : 'View'} log</Button>
                  <Button variant='outlined'>Edit</Button>
                  <Button variant='text' onClick={() => deleteResidence(residence.id)}>Delete</Button>
                </CardActions>
              </Card>
            )}
          </Stack>
        }
        <Button variant='contained' onClick={() => setAddingResidence(true)}>Add residence</Button>
      </Box>

      <Dialog open={addingResidence} onClose={() => setAddingResidence(false)}>
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
            />

            <TextField
              variant='standard'
              label='Year Built'
              value={newResidence.yearBuilt}
              onChange={(event) => setNewResidence({ ...newResidence, yearBuilt: event.target.value })}
            />

            <TextField
              variant='standard'
              label='Year Purchased'
              value={newResidence.yearPurchased}
              onChange={(event) => setNewResidence({ ...newResidence, yearPurchased: event.target.value })}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setAddingResidence(false)}>Cancel</Button>
            <Button variant='contained' onClick={addNewResidence}>Save</Button>
          </DialogActions>
        </Dialog>

      <Box mt={4}>
        <Typography variant='h4'>Vehicles</Typography>
        { vehicles &&
          <Stack direction='row'>
            { vehicles.map(vehicle =>
              <Card key={vehicle.vin}>
                { vehicle.img ?
                  <CardMedia component='img' height='250' src={vehicle.img} />
                  :
                  <Container><DirectionsCar sx={{ fontSize: 200 }} /></Container>
                }
                <CardContent>
                  <Typography variant='h5'>{vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}</Typography>
                  <Typography variant='body1'>Engine: {vehicle.engine}</Typography>
                  <Typography variant='body1'>Odometer: {vehicle.miles} mi</Typography>
                  <Typography variant='body1'>VIN: {vehicle.vin}</Typography>
                  <Typography variant='body1'>License Plate: {vehicle.licensePlate}</Typography>
                  
                  { vehicle.logShown &&
                    <Stack height={300}>
                      <DataGrid
                        columns={[{ field: 'date', headerName: 'Date' }, { field: 'note', headerName: 'Note' }]}
                        rows={vehicle.serviceLogEntries}
                        pageSize={5}
                        rowsPerPageOptions={[5, 10, 20]}
                        getRowId={row => row.date}
                      />
                      <Button variant='contained' startIcon={Add}>Add log item</Button>
                    </Stack>
                  }
                </CardContent>
                <CardActions>
                  <Button variant='contained' onClick={() => setVehicleLogVisibility(vehicle.vin)}>{vehicle.logShown ? 'Hide' : 'View'} log</Button>
                  <Button variant='outlined'>Edit</Button>
                  <Button variant='text' onClick={() => deleteVehicle(vehicle.id)}>Delete</Button>
                </CardActions>
              </Card>
            )}
          </Stack>
        }
        <Button variant='contained' onClick={() => setAddingVehicle(true)}>Add vehicle</Button>
      </Box>

      <Dialog open={addingVehicle} onClose={() => setAddingVehicle(false)}>
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
            onChange={(event) => setNewVehicle({ ...newVehicle, miles: parseInt(event.target.value) })}
          />

          <InputLabel>Upload Photo</InputLabel>
          <DropzoneArea
            acceptedFiles={['image/jpeg', 'image/png']}
            filesLimit={1}
            onChange={(files) => setNewVehImgFile(files[0])}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setAddingVehicle(false)}>Cancel</Button>
          <Button variant='contained' onClick={addNewVehicle}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Maintenance;
