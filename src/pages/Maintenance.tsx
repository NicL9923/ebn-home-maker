import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Container, Grid, Paper, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, DirectionsCar, House } from '@mui/icons-material';
import Image from 'material-ui-image';
import { FirebaseContext } from '../Firebase';
import { UserContext } from '../App';
import { Residence, Vehicle } from 'models/types';
import AddVehicle from 'components/Forms/AddVehicle';
import AddResidence from 'components/Forms/AddResidence';

// TODO: Refactor this thing...just...just refactor it PLEASE

const Maintenance = (): JSX.Element => {
  const firebase = useContext(FirebaseContext);
  const { profile, family, getFamily } = useContext(UserContext);
  const [residences, setResidences] = useState<Residence[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isFetchingResidences, setIsFetchingResidences] = useState(false);
  const [isFetchingVehicles, setIsFetchingVehicles] = useState(false);

  const [addingResidence, setAddingResidence] = useState(false);
  const [addingVehicle, setAddingVehicle] = useState(false);

  const getResidences = () => {
    if (!family?.residences) return;

    setIsFetchingResidences(true);
    const residencesArr: Residence[] = [];

    family.residences.forEach((residence) => {
      firebase.getResidence(residence).then((resDoc) => {
        if (resDoc.exists()) {
          const docData = resDoc.data();
          docData.serviceLogEntries.forEach((entry: any, index: number) => {
            entry.date = new Date(entry.date).toLocaleDateString();
            entry.id = index;
          });
          residencesArr.push(docData as Residence);
          setResidences(residencesArr);
        } else {
          // No residences found
        }
      });
    });

    setIsFetchingResidences(false);
  };

  const getVehicles = () => {
    if (!family?.vehicles) return;

    setIsFetchingVehicles(true);
    const vehiclesArr: Vehicle[] = [];

    family.vehicles.forEach((vehicle) => {
      firebase.getVehicle(vehicle).then((vehDoc) => {
        if (vehDoc.exists()) {
          const docData = vehDoc.data();
          docData.serviceLogEntries.forEach((entry: any, index: number) => {
            entry.date = new Date(entry.date).toLocaleDateString();
            entry.id = index;
          });
          vehiclesArr.push(docData as Vehicle);
          setVehicles(vehiclesArr);
        } else {
          // No vehicles found
        }
      });
    });

    setIsFetchingVehicles(false);
  };

  const deleteResidence = (resId: string) => {
    if (!family || !profile) return;

    firebase.deleteResidence(resId).then(() => {
      const newResIdArr = [...family.residences];
      newResIdArr.splice(
        newResIdArr.findIndex((res) => res === resId),
        1
      );

      firebase
        .updateFamily(profile.familyId, {
          residences: newResIdArr,
        })
        .then(() => getFamily());
    });
  };

  const deleteVehicle = (vehId: string) => {
    if (!family || !profile) return;

    firebase.deleteVehicle(vehId).then(() => {
      const newVehIdArr = [...family.vehicles];
      newVehIdArr.splice(
        newVehIdArr.findIndex((veh) => veh === vehId),
        1
      );

      firebase
        .updateFamily(profile.familyId, {
          vehicles: newVehIdArr,
        })
        .then(() => getFamily());
    });
  };

  // const addLogEntry = () => {};

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
        {!residences ? (
          isFetchingResidences && (
            <Box mx='auto' textAlign='center' mt={20}>
              <CircularProgress />
            </Box>
          )
        ) : (
          <Grid container mt={2} mb={2} gap={2}>
            {residences.map((residence) => (
              <Grid container item xs={12} md={6} lg={4} key={residence.name}>
                <Paper sx={{ p: 2 }}>
                  {residence.img ? (
                    <Image height='250' src={residence.img} />
                  ) : (
                    <Container>
                      <House sx={{ fontSize: 200 }} />
                    </Container>
                  )}

                  <Typography variant='h5'>{residence.name}</Typography>
                  <Typography variant='body1'>Built: {residence.yearBuilt}</Typography>
                  <Typography variant='body1'>Purchased: {residence.yearPurchased}</Typography>

                  <Typography variant='h6' mt={2}>
                    Service Log
                  </Typography>
                  <Box height={300}>
                    <DataGrid
                      columns={[
                        { field: 'date', headerName: 'Date' },
                        { field: 'note', headerName: 'Note', flex: 1 },
                      ]}
                      rows={residence.serviceLogEntries}
                      pageSize={5}
                      rowsPerPageOptions={[5, 10, 20]}
                    />
                  </Box>
                  <Button variant='contained' startIcon={<Add />} sx={{ mt: 1 }}>
                    Add to log
                  </Button>

                  <Typography variant='h6' mt={2}>
                    Maintenance
                  </Typography>
                  <Button variant='contained' startIcon={<Add />} sx={{ mt: 1 }}>
                    Edit maintenance schedule
                  </Button>

                  <Stack direction='row' justifyContent='right' spacing={1} mt={3}>
                    <Button variant='outlined'>Edit</Button>
                    <Button variant='text' onClick={() => deleteResidence(residence.id)}>
                      Delete
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
        <Button variant='contained' onClick={() => setAddingResidence(true)}>
          Add residence
        </Button>
      </Box>

      <AddResidence isOpen={addingResidence} setIsOpen={setAddingResidence} getResidences={getResidences} />

      <Box mt={4}>
        <Typography variant='h4'>Vehicles</Typography>
        {!vehicles ? (
          isFetchingVehicles && (
            <Box mx='auto' textAlign='center' mt={20}>
              <CircularProgress />
            </Box>
          )
        ) : (
          <Grid container mt={2} mb={2} gap={2}>
            {vehicles.map((vehicle) => (
              <Grid container item xs={12} md={6} lg={4} key={vehicle.vin}>
                <Paper sx={{ p: 2 }}>
                  {vehicle.img ? (
                    <Image height='250' src={vehicle.img} />
                  ) : (
                    <Container>
                      <DirectionsCar sx={{ fontSize: 200 }} />
                    </Container>
                  )}

                  <Typography variant='h5'>
                    {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                  </Typography>
                  <Typography variant='body1'>Engine: {vehicle.engine}</Typography>
                  <Typography variant='body1'>Odometer: {vehicle.miles} mi</Typography>
                  <Typography variant='body1'>VIN: {vehicle.vin}</Typography>
                  <Typography variant='body1'>License Plate: {vehicle.licensePlate}</Typography>

                  <Typography variant='h6' mt={2}>
                    Service Log
                  </Typography>
                  <Box height={300}>
                    <DataGrid
                      columns={[
                        { field: 'date', headerName: 'Date' },
                        { field: 'note', headerName: 'Note' },
                      ]}
                      rows={vehicle.serviceLogEntries}
                      pageSize={5}
                      rowsPerPageOptions={[5, 10, 20]}
                      getRowId={(row) => row.date}
                    />
                  </Box>
                  <Button variant='contained' startIcon={<Add />} sx={{ mt: 1 }}>
                    Add to log
                  </Button>

                  <Typography variant='h6' mt={2}>
                    Maintenance
                  </Typography>
                  <Button variant='contained' startIcon={<Add />} sx={{ mt: 1 }}>
                    Edit maintenance schedule
                  </Button>

                  <Stack direction='row' justifyContent='right' spacing={1} mt={3}>
                    <Button variant='outlined'>Edit</Button>
                    <Button variant='text' onClick={() => deleteVehicle(vehicle.id)}>
                      Delete
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
        <Button variant='contained' onClick={() => setAddingVehicle(true)}>
          Add vehicle
        </Button>
      </Box>

      <AddVehicle isOpen={addingVehicle} setIsOpen={setAddingVehicle} getVehicles={getVehicles} />
    </Box>
  );
};

export default Maintenance;
