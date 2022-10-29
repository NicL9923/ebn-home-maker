import React, { useEffect } from 'react';
import { Alert, Box, CircularProgress } from '@mui/material';
import { arrayUnion } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useAppStore } from '../../src/state/AppStore';
import { useUserStore } from '../../src/state/UserStore';

const JoinFamily = () => {
  const router = useRouter();
  const familyId = router.query['familyId'] as string;

  const firebase = useAppStore((state) => state.firebase);
  const userId = useUserStore((state) => state.userId);
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const addUserToFamily = () => {
    if (!familyId || !userId || profile?.familyId === familyId) {
      return;
    }

    firebase.updateFamily(familyId, { members: arrayUnion(userId) });
    firebase.updateProfile(userId, { familyId });
  };

  useEffect(() => {
    addUserToFamily();
  }, []);

  return (
    <Box maxWidth='md' mt={6} mx='auto'>
      {family ? (
        <Alert severity='success'>
          You&apos;ve successfully joined the {family.name} family! ({familyId})
        </Alert>
      ) : (
        <CircularProgress />
      )}
    </Box>
  );
};

export default JoinFamily;
