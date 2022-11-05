import React from 'react';
import { Residences } from 'components/Maintenance/Residences';
import { Vehicles } from 'components/Maintenance/Vehicles';
import { Box, Text } from '@chakra-ui/react';

const Maintenance = () => {
  return (
    <Box maxWidth='lg' mx='auto' mt={2}>
      <Text variant='h3'>Home & Auto Maintenance</Text>

      <Residences />

      <Vehicles />
    </Box>
  );
};

export default Maintenance;
