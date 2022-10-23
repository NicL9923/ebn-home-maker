import React from 'react';
import { Box, Typography } from '@mui/material';
import { Residences } from 'components/Maintenance/Residences';
import { Vehicles } from 'components/Maintenance/Vehicles';

const Maintenance = () => {
  return (
    <Box maxWidth='lg' mx='auto' mt={2}>
      <Typography variant='h3'>Home & Auto Maintenance</Typography>

      <Residences />

      <Vehicles />
    </Box>
  );
};

export default Maintenance;
