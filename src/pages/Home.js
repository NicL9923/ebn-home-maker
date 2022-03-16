import { Container, Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import Clock from 'react-live-clock';
import WeatherBox from '../components/WeatherBox';

const Home = (props) => {
  const { profile, family } = props;

  return (
    <Container>
      <Stack direction='column' alignItems='center'>
        <Box component={Typography} variant='h1'><Clock format={'h:mm A'} ticking={true} /></Box>
        {profile && 
          <Typography variant='h3'>Welcome back, {profile.firstName}!</Typography>
        }
        {family && 
          <Typography variant='h5'>The {family.name} family</Typography>
        }
      </Stack>

      {family && <WeatherBox familyLocation={family.location} apiKey={family.openweathermap_api_key} />}
    </Container>
  );
}

export default Home;