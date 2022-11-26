import type { ServiceLogEntry, Vehicle } from 'models/types';
import React, { useEffect, useState } from 'react';
import AddVehicle from 'components/Forms/AddVehicle';
import { MdAdd, MdDirectionsCar, MdEdit } from 'react-icons/md';
import { useUserStore } from 'state/UserStore';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { db, FsCol } from '../../firebase';
import { Box, Button, CircularProgress, Container, Grid, GridItem, Heading, Stack, Text } from '@chakra-ui/react';

export const Vehicles = () => {
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isFetchingVehicles, setIsFetchingVehicles] = useState(false);
  const [addingVehicle, setAddingVehicle] = useState(false);

  const batch = writeBatch(db);

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

    batch.commit();
  };

  // const addLogEntry = () => {};

  useEffect(() => {
    if (family) {
      getVehicles();
    }
  }, [family]);

  return (
    <Box mt={4}>
      <Heading>Vehicles</Heading>
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

                <Text>
                  {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                </Text>
                <Text>Engine: {vehicle.engine}</Text>
                <Text>Odometer: {vehicle.miles} mi</Text>
                <Text>VIN: {vehicle.vin}</Text>
                <Text>License Plate: {vehicle.licensePlate}</Text>

                <Text mt={2}>Service Log</Text>
                <Box height={300}>
                  {/*}
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
                  */}
                </Box>
                <Button leftIcon={<MdAdd />} sx={{ mt: 1 }}>
                  Add to log
                </Button>

                <Text mt={2}>Maintenance</Text>
                <Button leftIcon={<MdEdit />} sx={{ mt: 1 }}>
                  Edit maintenance schedule
                </Button>

                <Stack direction='row' justifyContent='right' spacing={1} mt={3}>
                  <Button>Edit</Button>
                  <Button onClick={() => deleteVehicle(vehicle.id)}>Delete</Button>
                </Stack>
              </Box>
            </GridItem>
          ))}
        </Grid>
      )}
      <Button onClick={() => setAddingVehicle(true)}>Add vehicle</Button>

      <AddVehicle isOpen={addingVehicle} setIsOpen={setAddingVehicle} />
    </Box>
  );
};
