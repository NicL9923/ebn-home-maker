import React, { useContext } from 'react';
import { Container, Paper, Stack, Typography } from '@mui/material';
import { UserContext } from '../App';
import { FirebaseContext } from '../Firebase';
import NoProfile from 'components/NoProfile';
import { UserProfile } from 'models/types';
import Family from 'components/Family';
import EditableLabel from 'components/Inputs/EditableLabel';
import EditableImage from 'components/Inputs/EditableImage';

const Profile = () => {
  const firebase = useContext(FirebaseContext);
  const { userId, profile, getProfile } = useContext(UserContext);

  const mergeProfileProperty = (profObjToMerge: Partial<UserProfile>, profileId = userId, refreshProfile = true) => {
    if (!profileId) return;

    firebase.updateProfile(profileId, profObjToMerge).then(() => {
      if (refreshProfile) getProfile();
    });
  };

  const updateProfileName = (newName?: string) => {
    if (!newName) return;

    mergeProfileProperty({ firstName: newName });
  };

  const updateProfileImgLink = (newImgLink: string) => {
    mergeProfileProperty({ imgLink: newImgLink });
  };

  return (
    <Container maxWidth='md'>
      {!profile ? (
        <NoProfile />
      ) : (
        <Paper sx={{ mb: 4, p: 3 }}>
          <Typography variant='h2'>My Profile</Typography>

          <Stack alignItems='center' justifyContent='center'>
            <EditableImage
              curImgLink={profile.imgLink}
              updateCurImgLink={updateProfileImgLink}
              imgPlaceholder={<Typography variant='h1'>{profile.firstName[0].toUpperCase()}</Typography>}
              height={164}
              width={164}
            />

            <EditableLabel
              textVariant='h5'
              text={profile.firstName}
              fieldName='First Name'
              fieldType='EntityName'
              onSubmitValue={updateProfileName}
            />
          </Stack>
        </Paper>
      )}

      <Family mergeProfileProperty={mergeProfileProperty} />
    </Container>
  );
};

export default Profile;
