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

export const UserContext = React.createContext(null);

const App = () => {
  const { auth, db } = useContext(FirebaseContext);
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [family, setFamily] = useState(null);

  const getProfile = () => {
    getDoc(doc(db, 'profiles', userId)).then(doc => {
      if (doc.exists()) setProfile(doc.data());
    });
  };

  const getFamily = () => {
    getDoc(doc(db, 'families', profile.familyId)).then(doc => {
      if (doc.exists()) setFamily(doc.data());
    });
  };

  useEffect(() => {
    onAuthStateChanged(auth, user => setUserId(user ? user.uid : null))
  }, []);

  useEffect(() => {
    if (userId) {
      getProfile();
    } else {
      setProfile(null);
    }
  }, [userId]);

  useEffect(() => {
    if (profile && profile.familyId) {
      getFamily();
    } else {
      setFamily(null);
    }
  }, [profile]);

  return (
    <UserContext.Provider
      value={{
        userId,
        profile,
        family,
        getProfile,
        getFamily
      }}
    >
      <Router>
        <Navbar />

        { userId ? (
          <Routes>
            { profile && 
              <>
                <Route exact path='/profile' element={<Profile />} />
                <Route exact path='/joinFamily/:familyId' element={<JoinFamily />} />
                <Route exact path='/finances' element={<Finances />} />
              </>
            }
            
            { family && 
              <>
                <Route exact path='/smarthome' element={<SmartHome />} />
                <Route exact path='/info' element={<Information />} />
                <Route exact path='/maintenance' element={<Maintenance />} />
              </>
            }

            <Route path='/' element={<Home />} />
            <Route element={<Home />} />
          </Routes>
        ) : (
          <NotLoggedIn auth={auth} />
        )}
      </Router>
    </UserContext.Provider>
  );
}

export default App;
