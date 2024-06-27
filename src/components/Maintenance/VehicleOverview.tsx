import {
  AspectRatio,
  Box,
  Card,
  CardBody,
  CircularProgress,
  Heading,
  Image,
  LinkBox,
  LinkOverlay,
  Stack,
  Text,
  Wrap,
  WrapItem
} from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { MdAdd, MdDirectionsCar } from 'react-icons/md';
import { FsCol, db } from '../../firebase';
import type { ServiceLogEntry, Vehicle } from '../../models/types';
import { useUserStore } from '../../state/UserStore';
import AddVehicle from '../Forms/AddVehicle';

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
                <Card height='320px'width='240px' overflow='hidden'>
                  <CardBody p={3}>
                    <AspectRatio ratio={4 / 3}>
                      {vehicle.img ? (
                        <Image src={vehicle.img} borderRadius='lg' />
                      ) : (
                        <Box>
                          <MdDirectionsCar fontSize={120} />
                        </Box>
                      )}
                    </AspectRatio>

                    <Stack direction='column' align='center' textAlign='center' mt={4}>
                      <LinkOverlay as={Link} to={`/maintenance/vehicles/${vehicle.uid}`}>
                        <Heading size='md'>{vehicle.year} {vehicle.make} {vehicle.model}</Heading>
                      </LinkOverlay>

                      <Text fontSize='sm'>{vehicle.miles} miles</Text>
                    </Stack>
                  </CardBody>
                </Card>
              </LinkBox>
            </WrapItem>
          ))}

          <WrapItem>
            <Card height='320px'width='240px' variant='outline' onClick={() => setAddingVehicle(true)} borderStyle='dashed' cursor='pointer'>
              <CardBody alignContent='center'>
                <Stack direction='column' align='center'>
                  <MdAdd fontSize={120} />

                  <Text>Add vehicle</Text>
                </Stack>
              </CardBody>
            </Card>
          </WrapItem>
        </Wrap>
      )}

      <AddVehicle isOpen={addingVehicle} setIsOpen={setAddingVehicle} />
    </Box>
  );
};
