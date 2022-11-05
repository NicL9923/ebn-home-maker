import { Box, Button, Stack, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import CreateProfile from './Forms/CreateProfile';

const NoProfile = () => {
  const [creatingProfile, setCreatingProfile] = useState(false);

  return (
    <Box maxWidth='sm' mx='auto' mt={2} p={2}>
      <Text variant='h5'>Welcome to Our Home!</Text>
      <Text variant='h6' mb={2}>
        It looks like you don&apos;t have a profile yet, would you like to create one?
      </Text>
      <Stack direction='row' justifyContent='center' mb={2}>
        <Button variant='contained' onClick={() => setCreatingProfile(true)}>
          Create a profile
        </Button>
      </Stack>
      <Text variant='caption'>
        Creating a profile allows you to create/join a budget and opens the door to family/household management!
      </Text>

      <CreateProfile isOpen={creatingProfile} setIsOpen={setCreatingProfile} />
    </Box>
  );
};

export default NoProfile;
