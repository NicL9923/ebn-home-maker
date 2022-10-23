import React, { useContext, useEffect } from 'react';
import { Alert, Box, CircularProgress } from '@mui/material';
import { arrayUnion } from 'firebase/firestore';
import { UserContext } from '../../src/providers/AppProvider';
import { FirebaseContext } from '../../src/providers/FirebaseProvider';
import { useRouter } from 'next/router';

const JoinFamily = () => {
  const router = useRouter();
  const familyId = router.query['familyId'] as string;
  const firebase = useContext(FirebaseContext);
  const { userId, profile, family, getProfile, getFamily } = useContext(UserContext);

  const addUserToFamily = () => {
    if (!familyId || !userId || profile?.familyId === familyId) {
      return;
    }

    // Add familyId to profile(user.uid).familyId, getFamily, and show success message
    firebase.updateFamily(familyId, { members: arrayUnion(userId) });

    firebase.updateProfile(userId, { familyId }).then(() => {
      getProfile();
      getFamily();
    });
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
