import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, getDoc, doc } from 'firebase/firestore';

import Home from './pages/Home';
import SmartHome from './pages/SmartHome';
import Budget from './pages/Budget';
import Information from './pages/Information';
import Maintenance from './pages/Maintenance';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import JoinFamily from './pages/JoinFamily';


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
    } else {
      // User doesn't have profile -> TODO: prompt them to set at least their name
    }
  };

  const getFamily = async (familyId) => {
    const familyDoc = await getDoc(doc(db, 'families', familyId));
    if (familyDoc.exists()) {
      const familyData = familyDoc.data();
      setFamily(familyData);
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

  return (
    <Router>
      <Navbar user={user} profile={profile} auth={auth} />

      <Routes>
        <Route path="/smarthome" element={<SmartHome />} />
        <Route path="/budget" element={<Budget db={db} profile={profile} />} />
        <Route path="/info" element={<Information />} />
        <Route path="/maintenance" element={<Maintenance family={family} db={db} />} />
        <Route path="/profile" element={<Profile profile={profile} getProfile={getProfile} family={family} getFamily={getFamily} user={user} db={db} />} />
        <Route path='/joinFamily/:familyId' element={<JoinFamily profile={profile} getProfile={getProfile} user={user} family={family} getFamily={getFamily} db={db} />} />
        <Route path="/" element={<Home profile={profile} family={family} user={user} auth={auth} />} />
      </Routes>
    </Router>
  );
}

export default App;
