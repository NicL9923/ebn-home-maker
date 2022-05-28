import React, { useContext, useEffect, useState } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { Box, Button, Card, CardActions, CardContent, CardMedia, Paper, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add } from '@mui/icons-material';
import { FirebaseContext } from '..';
import { UserContext } from '../App';

const Maintenance = () => {
  const { db } = useContext(FirebaseContext);
  const { family } = useContext(UserContext);
  const [residences, setResidences] = useState(null);
  const [vehicles, setVehicles] = useState(null);

  const getResidences = () => {
    if (!family.residences) return;

    let residencesArr = [];

    family.residences.forEach(async (residence) => {
      const residenceDoc = await getDoc(doc(db, 'residences', residence));

      if (residenceDoc.exists()) {
        const docData = residenceDoc.data();
        docData.serviceLogEntries.forEach((entry, index) => {
          entry.date = entry.date.toDate(); // Convert Firestore timestamp to JS date
          entry.id = index;
        });
        residencesArr.push(docData);
        setResidences(residencesArr);
      } else {
        // No residences found
      }
    });
  };

  const getVehicles = () => {
    if (!family.vehicles) return;

    let vehiclesArr = [];

    family.vehicles.forEach(async (vehicle) => {
      const vehicleDoc = await getDoc(doc(db, 'vehicles', vehicle));

      if (vehicleDoc.exists()) {
        const docData = vehicleDoc.data();
        docData.serviceLogEntries.forEach((entry, index) => {
          entry.date = entry.date.toDate(); // Convert Firestore timestamp to JS date
          entry.id = index;
        });
        vehiclesArr.push(docData);
        setVehicles(vehiclesArr);
      } else {
        // No vehicles found
      }
    });
  };

  const setResidenceLogVisibility = (resKey) => {
    let residenceArr = residences;

    residenceArr.forEach(res => {
      if (res.name === resKey) {
        res.logShown = !res.logShown
      }
    });

    setResidences([...residenceArr]);
  };

  const setVehicleLogVisibility = (vehKey) => {
    let vehicleArr = vehicles;

    vehicleArr.forEach(veh => {
      if (veh.vin === vehKey) {
        veh.logShown = !veh.logShown
      }
    });

    setVehicles([...vehicleArr]);
  };

  useEffect(() => {
    if (family) {
      getResidences();
      getVehicles();
    }
  }, [family]);

  return (
    <Box maxWidth='lg' mx='auto' mt={2}>
      <Paper sx={{ p: 2 }}>
        <Typography variant='h3'>Maintenance</Typography>

        <Box mt={2}>
          <Typography variant='h4'>Residences</Typography>
          {residences && 
            <Stack direction='row'>
              {residences.map(residence =>
                <Card key={residence.name}>
                  <CardMedia component='img' height='250' src={residence.img} />
                  <CardContent>
                    <Typography variant='h5'>{residence.name}</Typography>
                    <Typography variant='body1'>Built: {residence.yearBuilt}</Typography>
                    <Typography variant='body1'>Purchased: {residence.yearPurchased}</Typography>

                    {residence.logShown && 
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
                    <Button variant='text'>Delete</Button>
                  </CardActions>
                </Card>
              )}
            </Stack>
          }
          <Button variant='contained'>Add residence</Button>
        </Box>

        <Box mt={4}>
          <Typography variant='h4'>Vehicles</Typography>
          {vehicles &&
            <Stack direction='row'>
              {vehicles.map(vehicle =>
                <Card key={vehicle.vin}>
                  <CardMedia component='img' height='250' src={vehicle.img} />
                  <CardContent>
                    <Typography variant='h5'>{vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}</Typography>
                    <Typography variant='body1'>Engine: {vehicle.engine}</Typography>
                    <Typography variant='body1'>Odometer: {vehicle.miles} mi</Typography>
                    <Typography variant='body1'>VIN: {vehicle.vin}</Typography>
                    <Typography variant='body1'>License Plate: {vehicle.licensePlate}</Typography>
                    
                    {vehicle.logShown &&
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
                    <Button variant='text'>Delete</Button>
                  </CardActions>
                </Card>
              )}
            </Stack>
          }
          <Button variant='contained'>Add vehicle</Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default Maintenance;
