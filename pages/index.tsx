import { CircularProgress, Container, Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import Clock from 'react-live-clock';
import NoFamily from '../src/components/NoFamily';
import NoProfile from '../src/components/NoProfile';
import WeatherBox from '../src/components/WeatherBox';
import { useUserStore } from 'state/UserStore';

const Home = () => {
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);
  const isFetchingProfile = useUserStore((state) => state.isFetchingProfile);
  const isFetchingFamily = useUserStore((state) => state.isFetchingFamily);

  return (
    <Container>
      <Stack direction='column' alignItems='center' mb={5}>
        <Box component={Typography} variant='h2'>
          <Clock format={'h:mm A'} ticking={true} />
        </Box>

        {profile ? (
          <Typography variant='h5'>Welcome back, {profile.firstName}!</Typography>
        ) : isFetchingProfile ? (
          <Box mx='auto' textAlign='center' mt={20}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <NoProfile />
        )}

        {family && <Typography variant='h6'>The {family.name} family</Typography>}
      </Stack>

      {family ? (
        <WeatherBox />
      ) : isFetchingFamily ? (
        <Box mx='auto' textAlign='center' mt={20}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        profile && <NoFamily />
      )}
    </Container>
  );
};

export default Home;
