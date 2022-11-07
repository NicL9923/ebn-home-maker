import React from 'react';
import { Residences } from 'components/Maintenance/Residences';
import { Vehicles } from 'components/Maintenance/Vehicles';
import { Box, Heading } from '@chakra-ui/react';

const Maintenance = () => {
  return (
    <Box maxWidth='lg' mx='auto' mt={2}>
      <Heading>Home & Auto Maintenance</Heading>

      <Residences />

      <Vehicles />
    </Box>
  );
};

export default Maintenance;
