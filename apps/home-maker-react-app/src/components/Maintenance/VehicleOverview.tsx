import type { ServiceLogEntry, Vehicle } from 'models/types';
import React, { useEffect, useState } from 'react';
import AddVehicle from 'components/Forms/AddVehicle';
import { MdDirectionsCar } from 'react-icons/md';
import { useUserStore } from 'state/UserStore';
import { doc, getDoc } from 'firebase/firestore';
import { db, FsCol } from '../../firebase';
import {
  Box,
  Button,
  CircularProgress,
  Heading,
  Image,
  LinkBox,
  LinkOverlay,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';

export const VehicleOverview = () => {
  const family = useUserStore((state) => state.family);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isFetchingVehicles, setIsFetchingVehicles] = useState(false);
  const [addingVehicle, setAddingVehicle] = useState(false);

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
