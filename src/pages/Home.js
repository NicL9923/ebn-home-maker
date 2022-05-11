import { Container, Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import Clock from 'react-live-clock';
import NoFamily from '../components/NoFamily';
import NoProfile from '../components/NoProfile';
import WeatherBox from '../components/WeatherBox';

const Home = (props) => {
  const { profile, family, db, getProfile, getFamily, user } = props;

  return (
    <Container>
      <Stack direction='column' alignItems='center' mb={5}>
        <Box component={Typography} variant='h1'><Clock format={'h:mm A'} ticking={true} /></Box>

        {profile ?
          (<Typography variant='h3'>Welcome back, {profile.firstName}!</Typography>)
          :
          (<NoProfile db={db} getProfile={getProfile} user={user} />)
        }

        {family && 
          <Typography variant='h5'>The {family.name} family</Typography>
        }
      </Stack>

      {family ? (<WeatherBox familyLocation={family.location} apiKey={family.openweathermap_api_key} />) :
        (<NoFamily profile={profile} db={db} user={user} getProfile={getProfile} getFamily={getFamily} />)
      }
    </Container>
  );
}

export default Home;