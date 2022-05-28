import React, { useContext, useEffect } from 'react';
import { CircularProgress, Stack } from '@mui/material';
import { useParams } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { FirebaseContext } from '..';
import { UserContext } from '../App';

// TODO: flesh this out

const JoinFamily = () => {
    const { familyId } = useParams();
    const { db } = useContext(FirebaseContext);
    const { userId, profile, family, getProfile, getFamily } = useContext(UserContext);

    const addUserToFamily = () => {
        if (!profile || profile.familyId === familyId) return;

        // Add familyId to profile(user.uid).familyId, getFamily, and show success message
        setDoc(doc(db, 'profiles', userId), { familyId }, { merge: true }).then(() => {
            getProfile();
            getFamily();
        });
    };

    useEffect(() => {
        addUserToFamily();
    }, []);
  
    return (
        <>
            { family ? (
                <Stack>
                    You have joined the {family.name} family! ({familyId})
                </Stack>
            ) : (
                <CircularProgress />
            )}
        </>
    );
};

export default JoinFamily;
