import React from 'react';
import NoProfile from '../src/components/NoProfile';
import Family from '../src/components/Family';
import EditableLabel from '../src/components/Inputs/EditableLabel';
import EditableImage from '../src/components/Inputs/EditableImage';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useUserStore } from '../src/state/UserStore';
import { auth, db, FsCol } from '../src/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Box, Button, Container, Heading, Stack, useToast } from '@chakra-ui/react';

const ProfilePage = () => {
  const toast = useToast();
  const userId = useUserStore((state) => state.userId);
  const userEmail = useUserStore((state) => state.userEmail);
  const profile = useUserStore((state) => state.profile);

  if (!userId) {
    return null;
  }

  const updateProfileName = (newName?: string) => {
    if (newName) {
      updateDoc(doc(db, FsCol.Profiles, userId), { firstName: newName });
    }
  };

  const updateProfileImgLink = (newImgLink: string) => {
    updateDoc(doc(db, FsCol.Profiles, userId), { imgLink: newImgLink });
  };

  const handlePasswordReset = () => {
    if (!userEmail) {
      alert('There is no email tied to this account!');
      return;
    }

    sendPasswordResetEmail(auth, userEmail)
      .then(() => {
        toast({
          title: `Password reset email sent to ${userEmail}`,
          status: 'info',
          isClosable: true,
        });
      })
      .catch((error) => {
        toast({
          title: `Error sending password reset email: ${error.message}`,
          status: 'error',
          isClosable: true,
        });
      });
  };

  const userUsesEmailPasswordAuth = auth.currentUser?.providerData.some(
    (provider) => provider.providerId === 'password'
  );

  return (
    <Container>
      {!profile ? (
        <NoProfile />
      ) : (
        <Box mb={4} p={3}>
          <Heading>My Profile</Heading>

          <Stack alignItems='center' justifyContent='center'>
            <EditableImage
              curImgLink={profile.imgLink}
              updateCurImgLink={updateProfileImgLink}
              height={164}
              width={164}
            />

            <EditableLabel
              textSize='2xl'
              text={profile.firstName}
              fieldName='First Name'
              fieldType='EntityName'
              onSubmitValue={updateProfileName}
            />

            <Stack direction='row' justifyContent='space-evenly' sx={{ mt: 3 }}>
              {userUsesEmailPasswordAuth && <Button onClick={handlePasswordReset}>Reset password (email)</Button>}
            </Stack>
          </Stack>
        </Box>
      )}

      <Family />
    </Container>
  );
};

export default ProfilePage;
