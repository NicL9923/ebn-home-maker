import React from 'react';
import Clock from 'react-live-clock';
import WeatherBox from '../src/components/WeatherBox';
import { useUserStore } from 'state/UserStore';
import { Box, Container, Heading, Stack } from '@chakra-ui/react';

const Home = () => {
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  return (
    <Container>
      <Stack direction='column' alignItems='center' mb={5}>
        <Box>
          <Clock format={'h:mm A'} ticking={true} />
        </Box>

        {profile && <Heading>Welcome back, {profile.firstName}!</Heading>}

        {family && <Heading>The {family.name} family</Heading>}
      </Stack>

      {family && <WeatherBox />}
    </Container>
  );
};

export default Home;
