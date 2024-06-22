import { Container, Heading, Text } from '@chakra-ui/react';
import WeatherBox from '../components/WeatherBox';
import { useUserStore } from '../state/UserStore';
import Clock from '../components/Clock';

const Home = () => {
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  return (
    <Container centerContent>
      {family && <Heading mt='5'>The {family.name} family</Heading>}

      {profile && <Text fontSize='xl'>Welcome back, {profile.firstName}!</Text>}

      <Heading size='lg' mt={5} mb={3}>
        <Clock />
      </Heading>

      {family && <WeatherBox />}
    </Container>
  );
};

export default Home;
