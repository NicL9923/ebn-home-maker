import { Container, Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import Clock from 'react-live-clock';
import WeatherBox from '../src/components/WeatherBox';
import { useUserStore } from 'state/UserStore';

const Home = () => {
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  return (
    <Container>
      <Stack direction='column' alignItems='center' mb={5}>
        <Box component={Typography} variant='h2'>
          <Clock format={'h:mm A'} ticking={true} />
        </Box>

        {profile && <Typography variant='h5'>Welcome back, {profile.firstName}!</Typography>}

        {family && <Typography variant='h6'>The {family.name} family</Typography>}
      </Stack>

      {family && <WeatherBox />}
    </Container>
  );
};

export default Home;
