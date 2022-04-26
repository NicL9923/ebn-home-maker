import React, { useEffect, useState } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { Button, Card, CardActionArea, CardActions, CardContent, CardMedia, Stack, Typography } from '@mui/material';

const Maintenance = (props) => {
  const { family, db } = props;
  const [residences, setResidences] = useState(null);
  const [vehicles, setVehicles] = useState(null);

  const getResidences = () => {
    let residencesArr = [];

    family.residences.forEach(async (residence) => {
      const residenceDoc = await getDoc(doc(db, 'residences', residence));

      if (residenceDoc.exists()) {
        const docData = residenceDoc.data();
        residencesArr.push(docData);
        setResidences(residencesArr);
      } else {
        // No residences found
      }
    });
  };

  const getVehicles = () => {
    let vehiclesArr = [];

    family.vehicles.forEach(async (vehicle) => {
      const vehicleDoc = await getDoc(doc(db, 'vehicles', vehicle));

      if (vehicleDoc.exists()) {
        const docData = vehicleDoc.data();
        vehiclesArr.push(docData);
        setVehicles(vehiclesArr);
      } else {
        // No vehicles found
      }
    });
  };

  useEffect(() => {
    if (family) {
      getResidences();
      getVehicles();
    }
  }, [family]);

  return (
    family ? (
      <>
        <Typography variant='h3'>Maintenance</Typography>

        <Typography variant='h4'>House</Typography>
        <Stack direction='row'>
          {residences && residences.map(residence =>
            <Card key={residence.name}>
              <CardMedia component='img' height='250' src={residence.img} />
              <CardContent>
                <Typography variant='h5'>{residence.name}</Typography>
                <Typography variant='body1'>Built: {residence.yearBuilt}</Typography>
                <Typography variant='body1'>Purchased: {residence.yearPurchased}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">View log</Button>
              </CardActions>
            </Card>
          )}
        </Stack>

        <Typography variant='h4'>Vehicles</Typography>
        <Stack direction='row'>
          {vehicles && vehicles.map(vehicle =>
            <Card key={vehicle.vin}>
              <CardMedia component='img' height='250' src={vehicle.img} />
              <CardContent>
                <Typography variant='h5'>{vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}</Typography>
                <Typography variant='body1'>Engine: {vehicle.engine}</Typography>
                <Typography variant='body1'>Odometer: {vehicle.miles}</Typography>
                <Typography variant='body1'>VIN: {vehicle.vin}</Typography>
                <Typography variant='body1'>License Plate: {vehicle.licensePlate}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">View log</Button>
              </CardActions>
            </Card>
          )}
        </Stack>
      </>
    ) : (
      <>You aren't part of a family yet!</>
    )
  );
}

export default Maintenance;
