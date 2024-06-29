import { Box, Button, Container, Heading, Stack, useToast } from '@chakra-ui/react';
import { sendPasswordResetEmail } from 'firebase/auth';
import Client from '../Client';
import Family from '../components/Family';
import EditableImage from '../components/Inputs/EditableImage';
import EditableLabel from '../components/Inputs/EditableLabel';
import NoProfile from '../components/NoProfile';
import { auth } from '../firebase';
import { useUserStore } from '../state/UserStore';

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
      Client.updateProfile(userId, { firstName: newName });
    }
  };

  const updateProfileImgLink = (newImgLink: string) => {
    Client.updateProfile(userId, { imgLink: newImgLink });
  };

  const handlePasswordReset = async () => {
    if (!userEmail) {
      alert('There is no email tied to this account!');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, userEmail);

      toast({
        title: `Password reset email sent to ${userEmail}`,
        status: 'info',
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: `Error sending password reset email: ${error.message}`,
        status: 'error',
        isClosable: true,
      });
    }
  };

  const userUsesEmailPasswordAuth = auth.currentUser?.providerData.some(
    (provider) => provider.providerId === 'password'
  );

  return (
    <Container maxWidth={{ base: 'full', md: '2xl' }}>
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
