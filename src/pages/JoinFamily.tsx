import React, { useContext, useEffect } from 'react';
import { Alert, Box, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import { arrayUnion } from 'firebase/firestore';
import { FirebaseContext } from '../Firebase';
import { UserContext } from '../App';

// TODO: flesh this out

const JoinFamily = () => {
  const { familyId } = useParams();
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
