import { Container, Heading, Text } from '@chakra-ui/react';
import React from 'react';

const SmartHome = () => {
  return (
    <Container centerContent textAlign='center' m={2} p={2} maxWidth='95vw'>
      <Heading size='2xl'>Smart Home</Heading>
      <Heading size='lg'>- Under Construction -</Heading>

      <Text mt='4'>
        Welcome to the Smart Home page! This page doesn&apos;t do anything yet - it&apos;s just here to remind me in
        case I want to do any cool smarthome integration stuff in the future!
      </Text>
    </Container>
  );
};

export default SmartHome;
