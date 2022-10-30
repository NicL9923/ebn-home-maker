import React, { useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import NotLoggedIn from '../components/NotLoggedIn';
import { Alert, Box, CircularProgress, Snackbar, useMediaQuery } from '@mui/material';
import ThemeProvider from 'providers/ThemeProvider';
import { ProviderProps } from 'providers/providerTypes';
import Navbar from 'components/Navbar';
import { ThemeType, localStorageThemeTypeKey } from '../constants';
import { useAppStore } from 'state/AppStore';
import { useUserStore } from 'state/UserStore';
import { doc } from 'firebase/firestore';
import { db, FsCol } from '../firebase';
import { Family, Profile } from 'models/types';
import NoProfile from 'components/NoProfile';
import NoFamily from 'components/NoFamily';
import { useAuthUser } from '@react-query-firebase/auth';
import { useFirestoreDocument } from '@react-query-firebase/firestore';

// TODO: Properly type useFirestoreDocuments because doc method of explicit generics is not playing nice
// TODO: Snackbar/console-error errors for mutation onErrors

const AppProvider = ({ children }: ProviderProps) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const snackbarData = useAppStore((state) => state.snackbarData);
  const setThemePreference = useAppStore((state) => state.setThemePreference);
  const setSnackbarData = useAppStore((state) => state.setSnackbarData);

  const userId = useUserStore((state) => state.userId);
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);
  const setUserId = useUserStore((state) => state.setUserId);
  const setUserEmail = useUserStore((state) => state.setUserEmail);
  const setProfile = useUserStore((state) => state.setProfile);
  const setFamily = useUserStore((state) => state.setFamily);

  const userAuth = useAuthUser(['user'], getAuth());
  const profileDoc = useFirestoreDocument(
    [FsCol.Profiles, userId ?? 'undefined'],
    doc(db, FsCol.Profiles, userId ?? 'undefined'),
    {
      subscribe: true,
    }
  );
  const familyDoc = useFirestoreDocument(
    [FsCol.Families, profile?.familyId ?? 'undefined'],
    doc(db, FsCol.Families, profile?.familyId ?? 'undefined'),
    {
      subscribe: true,
    }
  );

  useEffect(() => {
    setThemePreference(
      (localStorage.getItem(localStorageThemeTypeKey) as ThemeType) ?? prefersDarkMode
        ? ThemeType.Dark
        : ThemeType.Light
    );
  }, []);

  // Auth listener
  useEffect(() => {
    setUserId(userAuth?.data?.uid);
    setUserEmail(userAuth?.data?.email ?? undefined);
  }, [userAuth.data]);

  // Profile listener
  useEffect(() => {
    setProfile(profileDoc.data ? (profileDoc.data.data() as Profile) : undefined);
  }, [profileDoc.data]);

  // Family listener
  useEffect(() => {
    setFamily(familyDoc.data ? (familyDoc.data.data() as Family) : undefined);
  }, [familyDoc.data]);

  return (
    <ThemeProvider>
      <Navbar />

      {userAuth.isLoading || profileDoc.isLoading || familyDoc.isLoading ? (
        <Box mx='auto' textAlign='center' mt={20}>
          <CircularProgress size={80} />
        </Box>
      ) : !userId ? (
        <NotLoggedIn />
      ) : !profile ? (
        <NoProfile />
      ) : !family ? (
        <NoFamily />
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
