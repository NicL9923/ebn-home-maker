import {
  AspectRatio,
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
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { MdDirectionsCar } from 'react-icons/md';
import AddVehicle from '../Forms/AddVehicle';
import { FsCol, db } from '../../firebase';
import type { ServiceLogEntry, Vehicle } from '../../models/types';
import { useUserStore } from '../../state/UserStore';
import { Link } from '@tanstack/react-router';

export const VehicleOverview = () => {
  const family = useUserStore((state) => state.family);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isFetchingVehicles, setIsFetchingVehicles] = useState(false);
  const [addingVehicle, setAddingVehicle] = useState(false);

  const getVehicles = useCallback(async () => {
    if (!family?.vehicles) return;

    setIsFetchingVehicles(true);
    const vehiclesArr: Vehicle[] = [];

    const vehicleDocs = await Promise.all(family.vehicles.map((vehicle) => getDoc(doc(db, FsCol.Vehicles, vehicle))));

    vehicleDocs.forEach((vehDoc) => {
      if (vehDoc.exists()) {
        const docData = vehDoc.data();
        docData.serviceLogEntries.forEach((entry: ServiceLogEntry) => {
          entry.date = new Date(entry.date).toLocaleDateString();
        });
        vehiclesArr.push(docData as Vehicle);
      }
    });

    setVehicles(vehiclesArr);
    setIsFetchingVehicles(false);
  }, [family?.vehicles]);

  useEffect(() => {
    if (family) {
      getVehicles();
    }
  }, [family, getVehicles]);

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
                <LinkOverlay as={Link} to={`/maintenance/vehicles/${vehicle.uid}`} />

                <Box p={2} maxW='sm' borderWidth='1px' borderRadius='lg' overflow='hidden'>
                  <AspectRatio width='250px' ratio={4 / 3}>
                    {vehicle.img ? (
                      <Image height='250' src={vehicle.img} />
                    ) : (
                      <Box>
                        <MdDirectionsCar fontSize={96} />
                      </Box>
                    )}
                  </AspectRatio>

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
