import React from 'react';
import { ResidenceOverview } from 'components/Maintenance/ResidenceOverview';
import { VehicleOverview } from 'components/Maintenance/VehicleOverview';
import { Container, Heading } from '@chakra-ui/react';

const Maintenance = () => {
  return (
    <Container maxWidth='container.lg' mt={2}>
      <Heading size='2xl'>Home & Auto Maintenance</Heading>

      <ResidenceOverview />

      <VehicleOverview />
    </Container>
  );
};

export default Maintenance;
