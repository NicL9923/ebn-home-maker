import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, getDoc, doc } from 'firebase/firestore';

import Home from './pages/Home';
import SmartHome from './pages/SmartHome';
import Finances from './pages/Finances';
import Information from './pages/Information';
import Maintenance from './pages/Maintenance';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import JoinFamily from './pages/JoinFamily';
import NotLoggedIn from './components/NotLoggedIn';

// NOTE: Turns out this architecture of having top-level state and sending callbacks to children (pages),
// isn't quite in-line with React's ideals...that sucks because this method saves me from re-fetching stuff
// like the profile on each page load vs just getting all the necessary info on appFirstLoad, but we'll see
// as the app progresses how I want to handle this

const App = () => {
  const auth = getAuth();
  const db = getFirestore();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [family, setFamily] = useState(null);

  const getProfile = async (userId) => {
    const profileDoc = await getDoc(doc(db, 'profiles', userId));
    if (profileDoc.exists()) {
      const profileData = profileDoc.data();
      setProfile(profileData);
      getFamily(profileData.familyId);
    }
  };

  const getFamily = async (familyId) => {
    const familyDoc = await getDoc(doc(db, 'families', familyId));
    if (familyDoc.exists()) {
      const familyData = familyDoc.data();
      setFamily(familyData);
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

  return (
    <Router>
      <Navbar user={user} profile={profile} auth={auth} />

      { user ? (
        <Routes>
          { profile && 
            <>
              <Route exact path='/profile' element={<Profile key={profile} profile={profile} getProfile={getProfile} family={family} getFamily={getFamily} user={user} db={db} />} />
              <Route exact path='/joinFamily/:familyId' element={<JoinFamily profile={profile} getProfile={getProfile} user={user} family={family} getFamily={getFamily} db={db} />} />
              <Route exact path='/finances' element={<Finances user={user} db={db} profile={profile} getProfile={getProfile} />} />
            </>
          }
          
          { family && 
            <>
              <Route exact path='/smarthome' element={<SmartHome />} />
              <Route exact path='/info' element={<Information />} />
              <Route exact path='/maintenance' element={<Maintenance key={family} family={family} db={db} />} />
            </>
          }

          <Route path='/' element={<Home profile={profile} family={family} user={user} auth={auth} db={db} getProfile={getProfile} getFamily={getFamily} />} />
        </Routes>
      ) : (
        <NotLoggedIn auth={auth} />
      )}
    </Router>
  );
}

export default App;
