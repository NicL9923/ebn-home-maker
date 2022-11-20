import { Button, Container, Heading, Stack, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import CreateProfile from './Forms/CreateProfile';

const NoProfile = () => {
  const [creatingProfile, setCreatingProfile] = useState(false);

  return (
    <Container centerContent maxWidth='md' mx='auto' mt={2} p={2} textAlign='center'>
      <Heading size='lg' mb={2}>
        Welcome to Home Maker!
      </Heading>
      <Text mb={4}>It looks like you don&apos;t have a profile yet, would you like to create one?</Text>

      <Stack direction='row' justifyContent='center' mb={4}>
        <Button onClick={() => setCreatingProfile(true)} colorScheme='green'>
          Create a profile
        </Button>
      </Stack>

      <Text>Creating a profile opens the door to family/household management!</Text>

      <CreateProfile isOpen={creatingProfile} setIsOpen={setCreatingProfile} />
    </Container>
  );
};

export default NoProfile;
