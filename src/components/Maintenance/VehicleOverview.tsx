import type { ServiceLogEntry, Vehicle } from 'models/types';
import React, { useEffect, useState } from 'react';
import AddVehicle from 'components/Forms/AddVehicle';
import { MdDirectionsCar } from 'react-icons/md';
import { useUserStore } from 'state/UserStore';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { db, FsCol } from '../../firebase';
import {
  Box,
  Button,
  CircularProgress,
  Heading,
  Image,
  LinkBox,
  LinkOverlay,
  Stack,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';

export const VehicleOverview = () => {
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
      <Heading>Your Vehicles</Heading>
      {!vehicles ? (
        isFetchingVehicles && (
          <Box mx='auto' textAlign='center' mt={20}>
            <CircularProgress isIndeterminate />
          </Box>
        )
      ) : (
        <Wrap mt={2} mb={2} gap={2}>
          {vehicles.map((vehicle) => (
            <WrapItem key={vehicle.vin}>
              <LinkBox>
                <LinkOverlay href={`/maintenance/vehicles/${vehicle.uid}`} />

                <Box p={2} maxW='sm' borderWidth='1px' borderRadius='lg' overflow='hidden'>
                  {vehicle.img ? (
                    <Image height='250' src={vehicle.img} />
                  ) : (
                    <Box>
                      <MdDirectionsCar fontSize={96} />
                    </Box>
                  )}

                  <Text>
                    {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                  </Text>
                  <Text>Engine: {vehicle.engine}</Text>
                  <Text>Odometer: {vehicle.miles} mi</Text>
                  <Text>VIN: {vehicle.vin}</Text>
                  <Text>License Plate: {vehicle.licensePlate}</Text>

                  <Stack direction='row' justifyContent='right' spacing={1} mt={3}>
                    <Button size='sm'>Edit</Button>
                    <Button size='sm' onClick={() => deleteVehicle(vehicle.uid)}>
                      Delete
                    </Button>
                  </Stack>
                </Box>
              </LinkBox>
            </WrapItem>
          ))}
        </Wrap>
      )}
      <Button colorScheme='green' onClick={() => setAddingVehicle(true)} mt={2}>
        Add new vehicle
      </Button>

      <AddVehicle isOpen={addingVehicle} setIsOpen={setAddingVehicle} />
    </Box>
  );
};
