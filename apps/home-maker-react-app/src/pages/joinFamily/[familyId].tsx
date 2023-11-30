import React, { useEffect } from 'react';
import { arrayUnion, doc, writeBatch } from 'firebase/firestore';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useUserStore } from '../../src/state/UserStore';
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
import { db, FsCol } from '../../src/firebase';

const JoinFamily = () => {
  const router = useRouter();
  const familyId = router.query['familyId'] as string;
  const toast = useToast();

  const userId = useUserStore((state) => state.userId);
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const batch = writeBatch(db);

  const addUserToFamily = () => {
    if (!familyId || !userId) {
      return;
    }

    if (profile?.familyId === familyId) {
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
        title: `You've successfully joined the ${family.name} family! (${familyId})`,
        status: 'success',
        isClosable: true,
      });
    });
  };

  useEffect(() => {
    addUserToFamily();
  }, []);

  return (
    <Container centerContent mt={6}>
      {family ? (
        <Container centerContent>
          <Alert status='success'>
            <AlertIcon />

            <AlertDescription>{`Welcome to the ${family.name} family, ${profile.firstName}!`}</AlertDescription>
          </Alert>

          <Text>
            {`You've successfully joined the ${family.name} family! `}
            <Link href='/'>
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
