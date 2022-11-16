import React, { useEffect } from 'react';
import { arrayUnion, doc, writeBatch } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useUserStore } from '../../src/state/UserStore';
import { Alert, CircularProgress, Container, useToast } from '@chakra-ui/react';
import { useFirestoreWriteBatch } from '@react-query-firebase/firestore';
import { db, FsCol } from '../../src/firebase';

const JoinFamily = () => {
  const router = useRouter();
  const familyId = router.query['familyId'] as string;
  const toast = useToast();

  const userId = useUserStore((state) => state.userId);
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const batch = writeBatch(db);
  const batchMutation = useFirestoreWriteBatch(batch);

  const addUserToFamily = () => {
    if (!familyId || !userId || profile?.familyId === familyId) {
      return;
    }

    batch.update(doc(db, FsCol.Families, familyId), { members: arrayUnion(userId) });
    batch.update(doc(db, FsCol.Profiles, userId), { familyId });

    batchMutation.mutate(undefined, {
      onSuccess() {
        toast({
          title: `You've successfully joined the ${family.name} family! (${familyId})`,
          status: 'success',
          isClosable: true,
        });
      },
    });
  };

  useEffect(() => {
    addUserToFamily();
  }, []);

  return (
    <Container centerContent mt={6}>
      {family ? (
        <Alert status='success'>
          You&apos;ve successfully joined the {family.name} family! ({familyId})
        </Alert>
      ) : (
        <CircularProgress isIndeterminate size={32} />
      )}
    </Container>
  );
};

export default JoinFamily;
