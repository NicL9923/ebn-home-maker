import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useUserStore } from '../../../src/state/UserStore';
import { Alert, AlertDescription, AlertIcon, Button, CircularProgress, Container, Text } from '@chakra-ui/react';
import { MdArrowBack } from 'react-icons/md';

const VehicleView = () => {
  const router = useRouter();
  const vehicleId = router.query['vehicleId'] as string;

  const family = useUserStore((state) => state.family);

  return (
    <Container centerContent mt={6}>
      <Link href='/maintenance'>
        <Button leftIcon={<MdArrowBack />} variant='link' colorScheme='blue'>
          Go back
        </Button>
      </Link>

      {family ? (
        <Container centerContent>
          <Alert status='success'>
            <AlertIcon />
            <AlertDescription>{`You're now viewing Vehicle ${vehicleId}!`}</AlertDescription>
          </Alert>

          <Text>Coming Soon: Service log and maintenance schedule/reminders!</Text>
        </Container>
      ) : (
        <CircularProgress isIndeterminate size={32} />
      )}
    </Container>
  );
};

export default VehicleView;
