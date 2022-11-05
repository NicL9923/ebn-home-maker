import { Box, Text } from '@chakra-ui/react';
import React from 'react';

const SmartHome = () => {
  return (
    <Box maxWidth='sm' mx='auto' textAlign='center' mt={3} p={2}>
      <Text variant='h3'>Smart Home</Text>
      <Text variant='h5' mb={6}>
        - Under Construction -
      </Text>

      <Text variant='h6'>
        Welcome to the Smart Home page! This page doesn&apos;t do anything yet - it&apos;s just here to remind me in
        case I want to do any cool smarthome integration stuff in the future!
      </Text>
    </Box>
  );
};

export default SmartHome;
