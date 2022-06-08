import { CircularProgress, Container, Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { useContext } from 'react';
import Clock from 'react-live-clock';
import { UserContext } from '../App';
import NoFamily from '../components/NoFamily';
import NoProfile from '../components/NoProfile';
import WeatherBox from '../components/WeatherBox';

const Home = () => {
  const { profile, family, isFetchingProfile, isFetchingFamily } = useContext(UserContext);

  return (
    <Container>
      <Stack direction='column' alignItems='center' mb={5}>
        <Box component={Typography} variant='h1'><Clock format={'h:mm A'} ticking={true} /></Box>

        { profile ?
          (<Typography variant='h3'>Welcome back, {profile.firstName}!</Typography>)
          :
          (isFetchingProfile ? (<Box mx='auto' textAlign='center' mt={20}><CircularProgress size={60} /></Box>) : (<NoProfile />))
        }

        { family && 
          <Typography variant='h5'>The {family.name} family</Typography>
        }
      </Stack>

      { family ? (<WeatherBox />) : (isFetchingFamily ? (<Box mx='auto' textAlign='center' mt={20}><CircularProgress size={60} /></Box>) : (profile && <NoFamily />)) }
    </Container>
  );
}

export default Home;