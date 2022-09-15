import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import CreateProfile from './Forms/CreateProfile';

const NoProfile = (): JSX.Element => {
  const [creatingProfile, setCreatingProfile] = useState(false);

  return (
    <Box maxWidth='sm' mx='auto' mt={2}>
      <Paper sx={{ p: 2 }}>
        <Typography variant='h5'>Welcome to Our Home!</Typography>
        <Typography variant='h6' mb={2}>
          It looks like you don&apos;t have a profile yet, would you like to create one?
        </Typography>
        <Stack direction='row' justifyContent='center' mb={2}>
          <Button variant='contained' onClick={() => setCreatingProfile(true)}>
            Create a profile
          </Button>
        </Stack>
        <Typography variant='caption'>
          Creating a profile allows you to create/join a budget and opens the door to family/household management!
        </Typography>

        <CreateProfile isOpen={creatingProfile} setIsOpen={setCreatingProfile} />
      </Paper>
    </Box>
  );
};

export default NoProfile;
