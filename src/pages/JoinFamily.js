import React from 'react';
import { CircularProgress, Stack } from '@mui/material';
import { useParams } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';

const JoinFamily = (props) => {
    const { familyId } = useParams();
    const { profile, getProfile, user, family, getFamily, db } = props;

    const addUserToFamily = () => {
        if (!profile) return;

        // Add familyId to profile(user.uid).familyId, getFamily, and show success message
        setDoc(doc(db, 'profiles', user.uid), { familyId }, { merge: true }).then(() => {
            getProfile(user.uid);
            getFamily(familyId); // NOTE: Should probably use profile.familyId here but this should be fine...
        });
    };
  
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
