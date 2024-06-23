import { Box, Button, CircularProgress, Container, Heading, Image, Stack, Text } from '@chakra-ui/react';
import { Link, useParams } from '@tanstack/react-router';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { MdArrowBack } from 'react-icons/md';
import { FsCol, db } from '../../firebase';
import { vehicleRoute } from '../../main';
import { ServiceLogEntry, Vehicle } from '../../models/types';
import { useUserStore } from '../../state/UserStore';

const VehicleView = () => {
  const { vehicleId } = useParams({ from: vehicleRoute.id });

  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const batch = writeBatch(db);

  const [vehicle, setVehicle] = useState<Vehicle | undefined>(undefined);

  const getVehicle = useCallback(async () => {
    if (family && family.vehicles.includes(vehicleId)) {
      const vehDoc = await getDoc(doc(db, FsCol.Vehicles, vehicleId));

      if (vehDoc.exists()) {
        const docData = vehDoc.data();
        docData.serviceLogEntries.forEach((entry: ServiceLogEntry) => {
          entry.date = new Date(entry.date).toLocaleDateString();
        });

        setVehicle(docData as Vehicle);
      }
    }
  }, [family, vehicleId]);

  const deleteVehicle = () => {
    if (!family || !profile) return;

    const newVehIdArr = family.vehicles.filter((res) => res !== vehicleId);

    batch.update(doc(db, FsCol.Families, profile.familyId), { residences: newVehIdArr });
    batch.delete(doc(db, FsCol.Residences, vehicleId));

    batch.commit();
  };

  // const addLogEntry = () => {};

  useEffect(() => {
    getVehicle();
  }, [getVehicle]);

  return (
    <Container centerContent mt={6}>
      <Link to='/maintenance'>
        <Button leftIcon={<MdArrowBack />} variant='link' colorScheme='blue'>
          Go back
        </Button>
      </Link>

      {vehicle ? (
        <Container centerContent>
          <Heading>{`${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`}</Heading>

          {vehicle.img && <Image src={vehicle.img} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} />}

          <Box mt={4}>
            <Text fontSize='lg'>{`VIN: ${vehicle.vin}`}</Text>
            <Text fontSize='lg'>{`License Plate: ${vehicle.licensePlate}`}</Text>
            <Text fontSize='lg'>{`Odometer (mi): ${vehicle.miles}`}</Text>
          </Box>

          <Stack direction='row' justifyContent='right' spacing={1} mt={3}>
            <Button size='sm' colorScheme='red' onClick={deleteVehicle}>
              Delete
            </Button>
          </Stack>
        </Container>
      ) : (
        <CircularProgress isIndeterminate size={32} />
      )}
    </Container>
  );
};

export default VehicleView;
