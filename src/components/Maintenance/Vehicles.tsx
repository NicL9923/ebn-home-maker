import type { ServiceLogEntry, Vehicle } from 'models/types';
import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Container, Grid, Paper, Stack, Typography } from '@mui/material';
import AddVehicle from 'components/Forms/AddVehicle';
import { DataGrid } from '@mui/x-data-grid';
import { Add, DirectionsCar } from '@mui/icons-material';
import Image from 'material-ui-image';
import { useAppStore } from 'state/AppStore';
import { useUserStore } from 'state/UserStore';

export const Vehicles = () => {
  const firebase = useAppStore((state) => state.firebase);
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);
  const getFamily = useUserStore((state) => state.getFamily);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isFetchingVehicles, setIsFetchingVehicles] = useState(false);
  const [addingVehicle, setAddingVehicle] = useState(false);

  const getVehicles = () => {
    if (!family?.vehicles) return;

    setIsFetchingVehicles(true);
    const vehiclesArr: Vehicle[] = [];

    family.vehicles.forEach((vehicle) => {
      firebase.getVehicle(vehicle).then((vehDoc) => {
        if (vehDoc.exists()) {
          const docData = vehDoc.data();
          docData.serviceLogEntries.forEach((entry: ServiceLogEntry) => {
            entry.date = new Date(entry.date).toLocaleDateString();
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
      getVehicles();
    }
  }, [family]);

  return (
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
                    rows={vehicle.serviceLogEntries.map((entry, idx) => ({ ...entry, id: idx }))}
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

      <AddVehicle isOpen={addingVehicle} setIsOpen={setAddingVehicle} getVehicles={getVehicles} />
    </Box>
  );
};
