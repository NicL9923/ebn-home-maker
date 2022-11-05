import { Box, Button, Divider, Stack, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import CreateFamily from './Forms/CreateFamily';

const NoFamily = () => {
  const [creatingFamily, setCreatingFamily] = useState(false);

  return (
    <Box maxWidth='sm' mx='auto' mt={3} p={2}>
      <Text variant='h5' mb={3}>
        We couldn&apos;t find a family for this profile!
      </Text>

      <Text variant='h6' textAlign='center'>
        Ask your head-of-household for their family invite link
      </Text>
      <Divider sx={{ width: 250, mx: 'auto', mt: 2, mb: 2 }}>OR</Divider>
      <Stack direction='row' justifyContent='center'>
        <Button variant='contained' onClick={() => setCreatingFamily(true)}>
          Create a family
        </Button>
      </Stack>

      <CreateFamily isOpen={creatingFamily} setIsOpen={setCreatingFamily} />
    </Box>
  );
};

export default NoFamily;
