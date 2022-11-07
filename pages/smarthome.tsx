import { Box, Heading, Text } from '@chakra-ui/react';
import React from 'react';

const SmartHome = () => {
  return (
    <Box maxWidth='sm' mx='auto' textAlign='center' mt={3} p={2}>
      <Heading>Smart Home</Heading>
      <Heading mb={6}>- Under Construction -</Heading>

      <Text>
        Welcome to the Smart Home page! This page doesn&apos;t do anything yet - it&apos;s just here to remind me in
        case I want to do any cool smarthome integration stuff in the future!
      </Text>
    </Box>
  );
};

export default SmartHome;
