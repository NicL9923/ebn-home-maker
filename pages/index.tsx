import React from 'react';
import Clock from 'react-live-clock';
import WeatherBox from '../src/components/WeatherBox';
import { useUserStore } from 'state/UserStore';
import { Box, Container, Stack, Text } from '@chakra-ui/react';

const Home = () => {
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  return (
    <Container>
      <Stack direction='column' alignItems='center' mb={5}>
        <Box>
          <Clock format={'h:mm A'} ticking={true} />
        </Box>

        {profile && <Text variant='h5'>Welcome back, {profile.firstName}!</Text>}

        {family && <Text variant='h6'>The {family.name} family</Text>}
      </Stack>

      {family && <WeatherBox />}
    </Container>
  );
};

export default Home;
