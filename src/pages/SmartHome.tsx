import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

const SmartHome = (): JSX.Element => {
  return (
    <Box maxWidth="sm" mx="auto" textAlign="center" mt={3}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h3">Smart Home</Typography>
        <Typography variant="h5" mb={6}>
          - Under Construction -
        </Typography>

        <Typography variant="h6">
          Welcome to the Smart Home page! This page doesn't do anything yet -
          it's just here to remind me in case I want to do any cool smarthome
          integration stuff in the future!
        </Typography>
      </Paper>
    </Box>
  );
};

export default SmartHome;
