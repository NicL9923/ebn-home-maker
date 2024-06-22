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
import { arrayUnion, doc, writeBatch } from 'firebase/firestore';
import { useCallback, useEffect } from 'react';
import { FsCol, db } from '../firebase';
import { useUserStore } from '../state/UserStore';
import { Link, useParams } from '@tanstack/react-router';
import { joinFamilyRoute } from '../main';

const JoinFamily = () => {
  const { familyId } = useParams({ from: joinFamilyRoute.id });
  const toast = useToast();

  const userId = useUserStore((state) => state.userId);
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const batch = writeBatch(db);

  const addUserToFamily = useCallback(() => {
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

    batch.update(doc(db, FsCol.Families, familyId), { members: arrayUnion(userId) });
    batch.update(doc(db, FsCol.Profiles, userId), { familyId });

    batch.commit().then(() => {
      toast({
        title: `You've successfully joined the ${family?.name} family! (${familyId})`,
        status: 'success',
        isClosable: true,
      });
    });
  }, [batch, familyId, family, profile?.familyId, userId, toast]);

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
