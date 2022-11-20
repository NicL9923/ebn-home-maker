import { Box, Button, Heading, Stack, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import CreateProfile from './Forms/CreateProfile';

const NoProfile = () => {
  const [creatingProfile, setCreatingProfile] = useState(false);

  return (
    <Box maxWidth='sm' mx='auto' mt={2} p={2}>
      <Heading size='lg'>Welcome to Home Maker!</Heading>
      <Text mb={2}>It looks like you don&apos;t have a profile yet, would you like to create one?</Text>

      <Stack direction='row' justifyContent='center' mb={2}>
        <Button onClick={() => setCreatingProfile(true)}>Create a profile</Button>
      </Stack>

      <Text>Creating a profile opens the door to family/household management!</Text>

      <CreateProfile isOpen={creatingProfile} setIsOpen={setCreatingProfile} />
    </Box>
  );
};

export default NoProfile;
