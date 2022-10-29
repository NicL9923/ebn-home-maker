import React from 'react';
import { Button, Container, Paper, Stack, Typography } from '@mui/material';
import NoProfile from 'components/NoProfile';
import { UserProfile } from 'models/types';
import Family from 'components/Family';
import EditableLabel from 'components/Inputs/EditableLabel';
import EditableImage from 'components/Inputs/EditableImage';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useAppStore } from 'state/AppStore';
import { useUserStore } from 'state/UserStore';

const Profile = () => {
  const firebase = useAppStore((state) => state.firebase);
  const setSnackbarData = useAppStore((state) => state.setSnackbarData);
  const userId = useUserStore((state) => state.userId);
  const userEmail = useUserStore((state) => state.userEmail);
  const profile = useUserStore((state) => state.profile);
  const getProfile = useUserStore((state) => state.getProfile);

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

  const handlePasswordReset = () => {
    if (!userEmail) {
      alert('There is no email tied to this account!');
      return;
    }

    sendPasswordResetEmail(firebase.auth, userEmail)
      .then(() => {
        setSnackbarData({ msg: `Password reset email sent to ${userEmail}`, severity: 'info' });
      })
      .catch((error) => {
        setSnackbarData({ msg: `Error sending password reset email: ${error.message}`, severity: 'error' });
      });
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

            <Stack direction='row' justifyContent='space-evenly' sx={{ mt: 3 }}>
              <Button variant='outlined' onClick={handlePasswordReset}>
                Reset password (email)
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      <Family mergeProfileProperty={mergeProfileProperty} />
    </Container>
  );
};

export default Profile;
