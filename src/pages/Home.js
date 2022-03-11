import React from 'react';
import { signInWithRedirect, GoogleAuthProvider } from 'firebase/auth';
import Clock from 'react-live-clock';
import WeatherBox from '../components/WeatherBox';
import { Link } from 'react-router-dom';
import { ChipIcon, CogIcon, CreditCardIcon, DocumentTextIcon } from '@heroicons/react/outline';
import ProfileIcon from '../components/ProfileIcon';

const Home = (props) => {
  const { profile, family, user, auth } = props;
  const provider = new GoogleAuthProvider();

  const googleSignIn = () => signInWithRedirect(auth, provider);

  return (!user ? 
    (<div>
        <button onClick={googleSignIn}>Login</button>
    </div>)

    :

    (
    <div>
      {profile && <ProfileIcon imgLink={profile.imgLink} />}

      <Clock className='flex justify-center text-6xl' format={'h:mm A'} ticking={true} />
      {profile && <h3 className='flex justify-center text-4xl font-bold'>Welcome back, {profile.firstName}!</h3>}
      {family && <h5 className='flex justify-center text-xl'>The {family.name} family</h5>}

      {family && <WeatherBox familyLocation={family.location} apiKey={family.openweathermap_api_key} />}

      <div className='flex flex-row justify-center'>
        <Link to='/smarthome' className='flex flex-col items-center'>
          <ChipIcon className='h-20 w-20' />
          <h4 className='text-xl'>Smarthome</h4>
        </Link>
        <Link to='/budget' className='flex flex-col items-center'>
          <CreditCardIcon className='h-20 w-20' />
          <h4 className='text-xl'>Budget</h4>
        </Link>
        <Link to='/info' className='flex flex-col items-center'>
          <DocumentTextIcon className='h-20 w-20' />
          <h4 className='text-xl'>Information</h4>
        </Link>
        <Link to='/maintenance' className='flex flex-col items-center'>
          <CogIcon className='h-20 w-20' />
          <h4 className='text-xl'>Maintenance</h4>
        </Link>
      </div>
    </div>)
  );
}

export default Home;