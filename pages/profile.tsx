import React from 'react';
import NoProfile from 'components/NoProfile';
import Family from 'components/Family';
import EditableLabel from 'components/Inputs/EditableLabel';
import EditableImage from 'components/Inputs/EditableImage';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useUserStore } from 'state/UserStore';
import { auth, db, FsCol } from '../src/firebase';
import { useFirestoreDocumentMutation } from '@react-query-firebase/firestore';
import { doc } from 'firebase/firestore';
import { Box, Button, Container, Heading, Stack, Text, useToast } from '@chakra-ui/react';

const ProfilePage = () => {
  const toast = useToast();
  const userId = useUserStore((state) => state.userId);
  const userEmail = useUserStore((state) => state.userEmail);
  const profile = useUserStore((state) => state.profile);

  const familyDocMutation = useFirestoreDocumentMutation(doc(db, FsCol.Profiles, userId ?? 'undefined'), {
    merge: true,
  });

  const updateProfileName = (newName?: string) => {
    if (newName) {
      familyDocMutation.mutate({ firstName: newName });
    }
  };

  const updateProfileImgLink = (newImgLink: string) => {
    familyDocMutation.mutate({ imgLink: newImgLink });
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

  return (
    <Container maxWidth='md'>
      {!profile ? (
        <NoProfile />
      ) : (
        <Box mb={4} p={3}>
          <Heading>My Profile</Heading>

          <Stack alignItems='center' justifyContent='center'>
            <EditableImage
              curImgLink={profile.imgLink}
              updateCurImgLink={updateProfileImgLink}
              imgPlaceholder={<Heading>{profile.firstName[0].toUpperCase()}</Heading>}
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
              <Button onClick={handlePasswordReset}>Reset password (email)</Button>
            </Stack>
          </Stack>
        </Box>
      )}

      <Family />
    </Container>
  );
};

export default ProfilePage;
