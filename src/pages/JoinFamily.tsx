import React, { useContext, useEffect } from 'react';
import { Alert, Box, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { FirebaseContext } from '..';
import { UserContext } from '../App';

// TODO: flesh this out

const JoinFamily = () => {
  const { familyId } = useParams();
  const { db } = useContext(FirebaseContext);
  const { userId, profile, family, getProfile, getFamily } =
    useContext(UserContext);

  const addUserToFamily = () => {
    if (!profile || !familyId || !userId || profile.familyId === familyId) {
      return;
    }

    // Add familyId to profile(user.uid).familyId, getFamily, and show success message
    updateDoc(doc(db, 'families', familyId), { members: arrayUnion(userId) });

    updateDoc(doc(db, 'profiles', userId), { familyId }).then(() => {
      getProfile();
      getFamily();
    });
  };

  useEffect(() => {
    addUserToFamily();
  }, []);

  return (
    <Box maxWidth="md" mt={6} mx="auto">
      {family ? (
        <Alert severity="success">
          You've successfully joined the {family.name} family! ({familyId})
        </Alert>
      ) : (
        <CircularProgress />
      )}
    </Box>
  );
};

export default JoinFamily;
