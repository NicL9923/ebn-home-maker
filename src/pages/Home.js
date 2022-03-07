import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInWithRedirect, GoogleAuthProvider, signOut } from 'firebase/auth';
import Clock from 'react-live-clock';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import WeatherBox from '../components/WeatherBox';

const Home = () => {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  const db = getFirestore();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [familyName, setFamilyName] = useState(null);
  const [familyLocation, setFamilyLocation] = useState(null);
  const [owmApiKey, setOwmApiKey] = useState(null);

  const googleSignIn = () => signInWithRedirect(auth, provider);
  
  const handleSignOut = () => signOut(auth).then(() => {
    console.log("Successfully signed out");
  }).catch(error => {
    console.error("Error signing out: " + error);
  });

  const getProfile = async (userId) => {
    const profileDoc = await getDoc(doc(db, 'profiles', userId));
    if (profileDoc.exists()) {
      const profileData = profileDoc.data();
      setProfile(profileData);
      getFamilyName(profileData.familyId);
    } else {
      // User doesn't have profile -> TODO: prompt them to set at least their name
    }
  };

  const getFamilyName = async (familyId) => {
    const familyDoc = await getDoc(doc(db, 'families', familyId));
    if (familyDoc.exists()) {
      const familyData = familyDoc.data();
      setFamilyName(familyData.name);
      setFamilyLocation(familyData.location);
      setOwmApiKey(familyData.openweathermap_api_key);
    } else {
      // User doesn't have a family -> TODO: offer to create one, setting them as it's head and allowing them to send invite link
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, user => {
      setUser(user);
      if (user) {
        getProfile(user.uid);
      }
    })
  }, []);

  return (!user ? 
    (<div>
        <button onClick={googleSignIn}>Login</button>
    </div>)

    :

    (
    <div>
      <Clock format={'h:mm A'} ticking={true} />
      {profile && <h3>Welcome back, {profile.firstName}</h3>}
      {familyName && <h5>The {familyName} family</h5>}
      <button onClick={handleSignOut}>Sign Out</button>

      {owmApiKey && familyLocation && <WeatherBox familyLocation={familyLocation} apiKey={owmApiKey} />}

      <div>
        Icons + Text = links to other pages
        <div>Smarthome</div>
        <div>Budget</div>
        <div>Information</div>
        <div>Maintenance</div>
      </div>
    </div>)
  );
}

export default Home;