import type { ServiceLogEntry, Vehicle } from 'models/types';
import React, { useEffect, useState } from 'react';
import AddVehicle from 'components/Forms/AddVehicle';
import { MdAdd, MdDirectionsCar, MdEdit } from 'react-icons/md';
import { useUserStore } from 'state/UserStore';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { db, FsCol } from '../../firebase';
import { useFirestoreWriteBatch } from '@react-query-firebase/firestore';
import { Box, Button, CircularProgress, Container, Grid, GridItem, Stack, Text } from '@chakra-ui/react';

// TODO: Data grid

export const Vehicles = () => {
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isFetchingVehicles, setIsFetchingVehicles] = useState(false);
  const [addingVehicle, setAddingVehicle] = useState(false);

  const batch = writeBatch(db);
  const batchMutation = useFirestoreWriteBatch(batch);

  const getVehicles = () => {
    if (!family?.vehicles) return;

    setIsFetchingVehicles(true);
    const vehiclesArr: Vehicle[] = [];

    family.vehicles.forEach((vehicle) => {
      getDoc(doc(db, FsCol.Vehicles, vehicle)).then((vehDoc) => {
        if (vehDoc.exists()) {
          const docData = vehDoc.data();
          docData.serviceLogEntries.forEach((entry: ServiceLogEntry) => {
            entry.date = new Date(entry.date).toLocaleDateString();
          });
          vehiclesArr.push(docData as Vehicle);
          setVehicles(vehiclesArr);
        }
      });
    });

    setIsFetchingVehicles(false);
  };

  const deleteVehicle = (vehId: string) => {
    if (!family || !profile) return;

    const newVehIdArr = family.vehicles.filter((res) => res !== vehId);

    batch.update(doc(db, FsCol.Families, profile.familyId), { residences: newVehIdArr });
    batch.delete(doc(db, FsCol.Residences, vehId));

    batchMutation.mutate();
  };

  // const addLogEntry = () => {};

  useEffect(() => {
    if (family) {
      getVehicles();
    }
  }, [family]);

  return (
    <Box mt={4}>
      <Text variant='h4'>Vehicles</Text>
      {!vehicles ? (
        isFetchingVehicles && (
          <Box mx='auto' textAlign='center' mt={20}>
            <CircularProgress isIndeterminate />
          </Box>
        )
      ) : (
        <Grid mt={2} mb={2} gap={2}>
          {vehicles.map((vehicle) => (
            <GridItem key={vehicle.vin}>
              <Box p={2}>
                {vehicle.img ? (
                  <img height='250' src={vehicle.img} />
                ) : (
                  <Container>
                    <MdDirectionsCar />
                  </Container>
                )}

                <Text variant='h5'>
                  {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                </Text>
                <Text variant='body1'>Engine: {vehicle.engine}</Text>
                <Text variant='body1'>Odometer: {vehicle.miles} mi</Text>
                <Text variant='body1'>VIN: {vehicle.vin}</Text>
                <Text variant='body1'>License Plate: {vehicle.licensePlate}</Text>

                <Text variant='h6' mt={2}>
                  Service Log
                </Text>
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
                <Button variant='contained' leftIcon={<MdAdd />} sx={{ mt: 1 }}>
                  Add to log
                </Button>

                <Text variant='h6' mt={2}>
                  Maintenance
                </Text>
                <Button variant='contained' leftIcon={<MdEdit />} sx={{ mt: 1 }}>
                  Edit maintenance schedule
                </Button>

                <Stack direction='row' justifyContent='right' spacing={1} mt={3}>
                  <Button variant='outlined'>Edit</Button>
                  <Button variant='text' onClick={() => deleteVehicle(vehicle.id)}>
                    Delete
                  </Button>
                </Stack>
              </Box>
            </GridItem>
          ))}
        </Grid>
      )}
      <Button variant='contained' onClick={() => setAddingVehicle(true)}>
        Add vehicle
      </Button>

      <AddVehicle isOpen={addingVehicle} setIsOpen={setAddingVehicle} />
    </Box>
  );
};
