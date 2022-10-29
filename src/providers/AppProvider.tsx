import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import NotLoggedIn from '../components/NotLoggedIn';
import { Alert, Box, CircularProgress, Snackbar, useMediaQuery } from '@mui/material';
import ThemeProvider from 'providers/ThemeProvider';
import { ProviderProps } from 'providers/providerTypes';
import Navbar from 'components/Navbar';
import { ThemeType, localStorageThemeTypeKey } from '../constants';
import { useAppStore } from 'state/AppStore';
import { useUserStore } from 'state/UserStore';
import { doc, onSnapshot } from 'firebase/firestore';
import { DocTypes } from '../Firebase';
import { Family, UserProfile } from 'models/types';

const AppProvider = ({ children }: ProviderProps) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const firebase = useAppStore((state) => state.firebase);
  const snackbarData = useAppStore((state) => state.snackbarData);
  const setThemePreference = useAppStore((state) => state.setThemePreference);
  const setSnackbarData = useAppStore((state) => state.setSnackbarData);

  const userId = useUserStore((state) => state.userId);
  const profile = useUserStore((state) => state.profile);
  const isFetchingUser = useUserStore((state) => state.isFetchingUser);
  const isFetchingProfile = useUserStore((state) => state.isFetchingProfile);
  const isFetchingFamily = useUserStore((state) => state.isFetchingFamily);
  const setUserId = useUserStore((state) => state.setUserId);
  const setUserEmail = useUserStore((state) => state.setUserEmail);
  const setIsFetchingUser = useUserStore((state) => state.setIsFetchingUser);
  const setIsFetchingProfile = useUserStore((state) => state.setIsFetchingProfile);
  const setIsFetchingFamily = useUserStore((state) => state.setIsFetchingFamily);
  const setProfile = useUserStore((state) => state.setProfile);
  const setFamily = useUserStore((state) => state.setFamily);

  useEffect(() => {
    setThemePreference(
      (localStorage.getItem(localStorageThemeTypeKey) as ThemeType) ?? prefersDarkMode
        ? ThemeType.Dark
        : ThemeType.Light
    );
  }, []);

  // Auth listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(firebase.auth, (user) => {
      setUserId(user?.uid);
      setUserEmail(user?.email ?? undefined);
      setIsFetchingUser(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Profile listener
  useEffect(() => {
    if (userId) {
      setIsFetchingProfile(true);

      const unsubscribeProfileDoc = onSnapshot(doc(firebase.db, DocTypes.profile, userId), (doc) => {
        setProfile(doc.data() as UserProfile);
        setIsFetchingProfile(false);
      });

      return () => unsubscribeProfileDoc();
    } else {
      setProfile(undefined);
      setIsFetchingProfile(false);
    }
  }, [userId]);

  // Family listener
  useEffect(() => {
    if (profile?.familyId) {
      setIsFetchingFamily(true);

      const unsubscribeFamilyDoc = onSnapshot(doc(firebase.db, DocTypes.family, profile.familyId), (doc) => {
        setFamily(doc.data() as Family);
        setIsFetchingFamily(false);
      });

      return () => unsubscribeFamilyDoc();
    } else {
      setFamily(undefined);
      setIsFetchingFamily(false);
    }
  }, [profile?.familyId]);

  return (
    <ThemeProvider>
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
        <Alert onClose={() => setSnackbarData(undefined)} severity={snackbarData?.severity} sx={{ width: '100%' }}>
          {snackbarData?.msg}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default AppProvider;
