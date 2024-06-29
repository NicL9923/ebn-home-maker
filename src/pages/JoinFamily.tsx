import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  CircularProgress,
  Container,
  Text,
  useToast,
} from '@chakra-ui/react';
import { Link, useParams } from '@tanstack/react-router';
import { useCallback, useEffect } from 'react';
import Client from '../Client';
import { joinFamilyRoute } from '../main';
import { useUserStore } from '../state/UserStore';

const JoinFamily = () => {
  const { familyId } = useParams({ from: joinFamilyRoute.id });
  const toast = useToast();

  const userId = useUserStore((state) => state.userId);
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const addUserToFamily = useCallback(async () => {
    if (!familyId || !userId) {
      return;
    }

    if (profile?.familyId === familyId && family) {
      toast({
        title: `You're already apart of the ${family.name} family! (${familyId})`,
        status: 'info',
        isClosable: true,
      });

      return;
    }

    await Client.addUserToFamily(userId, familyId);

    toast({
      title: `You've successfully joined the ${family?.name} family! (${familyId})`,
      status: 'success',
      isClosable: true,
    });
  }, [familyId, family, profile?.familyId, userId, toast]);

  useEffect(() => {
    addUserToFamily();
  }, [addUserToFamily]);

  return (
    <Container centerContent mt={6}>
      {profile && family ? (
        <Container centerContent>
          <Alert status='success'>
            <AlertIcon />

            <AlertDescription>{`Welcome to the ${family.name} family, ${profile.firstName}!`}</AlertDescription>
          </Alert>

          <Text>
            {`You've successfully joined the ${family.name} family! `}
            <Link to='/'>
              <Button variant='link' colorScheme='blue'>
                Head home
              </Button>
            </Link>
            {` to get started!`}
          </Text>
        </Container>
      ) : (
        <CircularProgress isIndeterminate size={32} />
      )}
    </Container>
  );
};

export default JoinFamily;
