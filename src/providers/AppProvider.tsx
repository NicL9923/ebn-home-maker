import React, { useState, useEffect, useContext, createContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import NotLoggedIn from '../components/NotLoggedIn';
import { Alert, Box, CircularProgress, Snackbar, useMediaQuery } from '@mui/material';
import { AppContextValue, Family, SnackbarData, UserContextValue, UserProfile } from '../models/types';
import { FirebaseContext } from 'providers/FirebaseProvider';
import ThemeProvider from 'providers/ThemeProvider';
import { ProviderProps } from 'providers/providerTypes';
import Navbar from 'components/Navbar';
import { ThemeType, localStorageThemeTypeKey } from '../constants';

export const AppContext = createContext({} as AppContextValue);
export const UserContext = createContext({} as UserContextValue);

const AppProvider = ({ children }: ProviderProps) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const firebase = useContext(FirebaseContext);

  const [themePreference, setThemePreference] = useState<ThemeType>(prefersDarkMode ? ThemeType.Dark : ThemeType.Light);
  const [snackbarData, setSnackbarData] = useState<SnackbarData | undefined>(undefined);

  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [profile, setProfile] = useState<UserProfile | undefined>(undefined);
  const [family, setFamily] = useState<Family | undefined>(undefined);

  const [isFetchingUser, setIsFetchingUser] = useState(true);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [isFetchingFamily, setIsFetchingFamily] = useState(true);

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebase.auth, (user) => {
      setUserId(user?.uid);
      setUserEmail(user?.email ? user.email : undefined);
      setIsFetchingUser(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setThemePreference(localStorage.getItem(localStorageThemeTypeKey) as ThemeType);
  }, []);

  return (
    <AppContext.Provider value={{ themePreference, setThemePreference, setSnackbarData }}>
      <UserContext.Provider
        value={{
          userId,
          userEmail,
          profile,
          family,
          isFetchingProfile,
          isFetchingFamily,
          getProfile,
          getFamily,
          setFamily,
        }}
      >
        <ThemeProvider>
          <>
            <Navbar />

            {isFetchingUser || isFetchingProfile || isFetchingFamily ? (
              <Box mx='auto' textAlign='center' mt={20}>
                <CircularProgress size={80} />
              </Box>
            ) : !userId ? (
              <NotLoggedIn />
            ) : (
              children
            )}

            <Snackbar open={!!snackbarData} autoHideDuration={2000} onClose={() => setSnackbarData(undefined)}>
              <Alert
                onClose={() => setSnackbarData(undefined)}
                severity={snackbarData?.severity}
                sx={{ width: '100%' }}
              >
                {snackbarData?.msg}
              </Alert>
            </Snackbar>
          </>
        </ThemeProvider>
      </UserContext.Provider>
    </AppContext.Provider>
  );
};

export default AppProvider;
