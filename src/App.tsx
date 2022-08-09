import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import Home from './pages/Home';
import SmartHome from './pages/SmartHome';
import Finances from './pages/Finances';
import Information from './pages/Information';
import Maintenance from './pages/Maintenance';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import JoinFamily from './pages/JoinFamily';
import NotLoggedIn from './components/NotLoggedIn';
import { FirebaseContext } from '.';
import { Box, CircularProgress } from '@mui/material';
import { Family, UserContextValue, UserProfile } from 'models/types';

export const UserContext = React.createContext({} as UserContextValue);

const App = (): JSX.Element => {
  const { auth, db } = useContext(FirebaseContext);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [isFetchingUser, setIsFetchingUser] = useState(true);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [isFetchingFamily, setIsFetchingFamily] = useState(true);

  const getProfile = () => {
    if (userId) {
      setIsFetchingProfile(true);
      getDoc(doc(db, 'profiles', userId)).then((doc) => {
        setIsFetchingProfile(false);
        if (doc.exists()) setProfile(doc.data() as UserProfile);
      });
    } else {
      setProfile(null);
    }
  };

  const getFamily = () => {
    if (profile && profile.familyId) {
      setIsFetchingFamily(true);
      getDoc(doc(db, 'families', profile.familyId)).then((doc) => {
        setIsFetchingFamily(false);
        if (doc.exists()) setFamily(doc.data() as Family);
      });
    } else {
      setFamily(null);
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
      setIsFetchingUser(false);
    });
  }, []);

  useEffect(getProfile, [userId]);

  useEffect(getFamily, [profile]);

  return (
    <UserContext.Provider
      value={{
        userId,
        profile,
        family,
        isFetchingProfile,
        isFetchingFamily,
        getProfile,
        getFamily,
      }}
    >
      <Router>
        <Navbar />

        {userId ? (
          <Routes>
            {profile && (
              <>
                <Route path="/profile" element={<Profile />} />
                <Route path="/joinFamily/:familyId" element={<JoinFamily />} />
                <Route path="/finances" element={<Finances />} />
              </>
            )}

            {family && (
              <>
                <Route path="/smarthome" element={<SmartHome />} />
                <Route path="/info" element={<Information />} />
                <Route path="/maintenance" element={<Maintenance />} />
              </>
            )}

            <Route path="/" element={<Home />} />
            <Route element={<Home />} />
          </Routes>
        ) : isFetchingUser ? (
          <Box mx="auto" textAlign="center" mt={20}>
            <CircularProgress size={80} />
          </Box>
        ) : (
          <NotLoggedIn auth={auth} />
        )}
      </Router>
    </UserContext.Provider>
  );
};

export default App;
