import { Box, Button, Divider, Heading, Stack, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import CreateFamily from './Forms/CreateFamily';

const NoFamily = () => {
  const [creatingFamily, setCreatingFamily] = useState(false);

  return (
    <Box maxWidth='sm' mx='auto' mt={3} p={2}>
      <Heading mb={3}>We couldn&apos;t find a family for this profile!</Heading>

      <Text textAlign='center'>Ask your head-of-household for their family invite link</Text>
      <Divider sx={{ width: 250, mx: 'auto', mt: 2, mb: 2 }} />
      <Stack direction='row' justifyContent='center'>
        <Button onClick={() => setCreatingFamily(true)}>Create a family</Button>
      </Stack>

      <CreateFamily isOpen={creatingFamily} setIsOpen={setCreatingFamily} />
    </Box>
  );
};

export default NoFamily;
