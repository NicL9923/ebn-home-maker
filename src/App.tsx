import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import Home from './pages/Home';
import SmartHome from './pages/SmartHome';
import Finances from './pages/Finances';
import Information from './pages/Information';
import Maintenance from './pages/Maintenance';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import JoinFamily from './pages/JoinFamily';
import NotLoggedIn from './components/NotLoggedIn';
import { FirebaseContext } from './Firebase';
import { Box, CircularProgress } from '@mui/material';
import { Family, UserContextValue, UserProfile } from 'models/types';
import GroceryList from 'pages/GroceryList';

export const UserContext = React.createContext({} as UserContextValue);

const App = (): JSX.Element => {
  const firebase = useContext(FirebaseContext);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [profile, setProfile] = useState<UserProfile | undefined>(undefined);
  const [family, setFamily] = useState<Family | undefined>(undefined);
  const [isFetchingUser, setIsFetchingUser] = useState(true);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [isFetchingFamily, setIsFetchingFamily] = useState(true);

  onAuthStateChanged(firebase.auth, (user) => {
    setUserId(user ? user.uid : undefined);
    setIsFetchingUser(false);
  });

  const getProfile = () => {
    if (userId) {
      setIsFetchingProfile(true);
      firebase.getProfile(userId).then((doc) => {
        setIsFetchingProfile(false);
        if (doc.exists()) setProfile(doc.data() as UserProfile);
      });
    } else {
      setProfile(undefined);
      setIsFetchingProfile(false);
    }
  };

  const getFamily = () => {
    if (profile?.familyId) {
      setIsFetchingFamily(true);
      firebase.getFamily(profile.familyId).then((doc) => {
        setIsFetchingFamily(false);
        if (doc.exists()) setFamily(doc.data() as Family);
      });
    } else {
      setFamily(undefined);
      setIsFetchingFamily(false);
    }
  };

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
        setFamily,
      }}
    >
      {isFetchingUser || isFetchingProfile || isFetchingFamily ? (
        <Box mx='auto' textAlign='center' mt={20}>
          <CircularProgress size={80} />
        </Box>
      ) : userId ? (
        <Router>
          <Navbar />
          <Routes>
            {profile && (
              <>
                <Route path='/profile' element={<Profile />} />
                <Route path='/joinFamily/:familyId' element={<JoinFamily />} />
              </>
            )}

            {family && (
              <>
                <Route path='/finances' element={<Finances />} />
                <Route path='/smarthome' element={<SmartHome />} />
                <Route path='/info' element={<Information />} />
                <Route path='/maintenance' element={<Maintenance />} />
                <Route path='/grocerylist' element={<GroceryList />} />
              </>
            )}

            <Route path='/' element={<Home />} />
            <Route element={<Home />} />
          </Routes>
        </Router>
      ) : (
        <NotLoggedIn />
      )}
    </UserContext.Provider>
  );
};

export default App;
