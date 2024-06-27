import { AspectRatio, Button, ButtonGroup, CircularProgress, Container, Heading, Image, Stack, Text } from '@chakra-ui/react';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { MdArrowBack } from 'react-icons/md';
import ConfirmDialog from '../../components/ConfirmDialog';
import { FsCol, db } from '../../firebase';
import { vehicleRoute } from '../../main';
import { ServiceLogEntry, Vehicle } from '../../models/types';
import { useUserStore } from '../../state/UserStore';

const VehicleView = () => {
  const { vehicleId } = useParams({ from: vehicleRoute.id });
  const navigate = useNavigate();

  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const batch = writeBatch(db);

  const [vehicle, setVehicle] = useState<Vehicle | undefined>(undefined);
  const [isDeletingVehicle, setIsDeletingVehicle] = useState(false);

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

    const newVehIdArr = family.vehicles.filter((vehicle) => vehicle !== vehicleId);

    batch.update(doc(db, FsCol.Families, profile.familyId), { vehicles: newVehIdArr });
    batch.delete(doc(db, FsCol.Vehicles, vehicleId));

    batch.commit();

    navigate({ to: '/maintenance'});
  };

  // const addLogEntry = () => {};

  useEffect(() => {
    getVehicle();
  }, [getVehicle]);

  return (
    <>
      <Container>
        <Link to='/maintenance'>
          <Button leftIcon={<MdArrowBack />} variant='link' colorScheme='blue'>
            Go back
          </Button>
        </Link>

        {vehicle ? (
          <Stack align='center' spacing={4}>
            <Heading>{`${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`}</Heading>

            {vehicle.img && <AspectRatio height='250px' width='300px' ratio={4 / 3}><Image src={vehicle.img} borderRadius='lg' /></AspectRatio>}

            <Text fontSize='lg'>{`VIN: ${vehicle.vin}`}</Text>
            <Text fontSize='lg'>{`License plate: ${vehicle.licensePlate}`}</Text>
            <Text fontSize='lg'>{`Odometer: ${vehicle.miles} miles`}</Text>
            <Text fontSize='lg'>{`Engine: ${vehicle.engine}`}</Text>
            <Text fontSize='lg'>{`Fuel capacity: ${vehicle.fuelCapacity}`}</Text>

            <ButtonGroup>
              <Button size='sm' onClick={() => undefined}>
                Edit
              </Button>

              <Button size='sm' colorScheme='red' onClick={() => setIsDeletingVehicle(true)}>
                Delete
              </Button>
            </ButtonGroup>
          </Stack>
        ) : (
          <CircularProgress isIndeterminate size={32} />
        )}
      </Container>

      <ConfirmDialog
        title='Delete vehicle'
        text='Are you sure you want to delete this vehicle?'
        primaryActionText='Delete'
        isOpen={isDeletingVehicle}
        onClose={(confirmed) => {
          if (confirmed) {
            deleteVehicle();
          }

          setIsDeletingVehicle(false);
        }}
      />
    </>
  );
};

export default VehicleView;
