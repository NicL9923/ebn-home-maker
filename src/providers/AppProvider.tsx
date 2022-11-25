import React, { useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import ThemeProvider from 'providers/ThemeProvider';
import { ProviderProps } from 'providers/providerTypes';
import Navbar from 'components/Navbar';
import { useUserStore } from 'state/UserStore';
import { doc } from 'firebase/firestore';
import { db, FsCol } from '../firebase';
import { Family, Profile } from 'models/types';
import NoProfile from 'components/NoProfile';
import NoFamily from 'components/NoFamily';
import { useAuthUser } from '@react-query-firebase/auth';
import { useFirestoreDocumentData } from '@react-query-firebase/firestore';
import { Box, CircularProgress, useToast } from '@chakra-ui/react';
import LandingPage from 'components/LandingPage';
import { useRouter } from 'next/router';

// TODO: Properly type useFirestoreDocuments because doc method of explicit generics is not playing nice
// TODO: Snackbar/console-error errors for mutation onErrors

const AppProvider = ({ children }: ProviderProps) => {
  const router = useRouter();
  const toast = useToast();
  const userId = useUserStore((state) => state.userId);
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);
  const setUserId = useUserStore((state) => state.setUserId);
  const setUserEmail = useUserStore((state) => state.setUserEmail);
  const setProfile = useUserStore((state) => state.setProfile);
  const setFamily = useUserStore((state) => state.setFamily);

  const userAuth = useAuthUser(['user'], getAuth());
  const profileDocData = useFirestoreDocumentData(
    [FsCol.Profiles, userId],
    doc(db, FsCol.Profiles, userId ?? 'undefined'),
    {
      subscribe: true,
    },
    {
      onError(error) {
        toast({
          title: `Error getting profile data`,
          description: error.message,
          status: 'error',
          isClosable: true,
        });
      },
    }
  );
  const familyDocData = useFirestoreDocumentData(
    [FsCol.Families, profile?.familyId],
    doc(db, FsCol.Families, profile?.familyId ?? 'undefined'),
    {
      subscribe: true,
    },
    {
      onError(error) {
        toast({
          title: `Error getting family data`,
          description: error.message,
          status: 'error',
          isClosable: true,
        });
      },
    }
  );

  // Auth listener
  useEffect(() => {
    setUserId(userAuth?.data?.uid);
    setUserEmail(userAuth?.data?.email ?? undefined);
  }, [userAuth.data]);

  // Profile listener
  useEffect(() => {
    setProfile(profileDocData.data ? (profileDocData.data as Profile) : undefined);
  }, [profileDocData.data]);

  // Family listener
  useEffect(() => {
    setFamily(familyDocData.data ? (familyDocData.data as Family) : undefined);
  }, [familyDocData.data]);

  const getPageContent = () => {
    if (router.pathname.includes('login') || router.pathname.includes('signup')) {
      return children;
    }

    if (router.pathname.includes('joinFamily')) {
      return children;
    }

    if (!userAuth.isLoading && !userAuth.isError && !userId) {
      return <LandingPage />;
    }

    if (!profileDocData.isLoading && !profileDocData.isError && !profile) {
      return <NoProfile />;
    }

    if (!familyDocData.isLoading && !familyDocData.isError && !family) {
      return <NoFamily />;
    }

    if (userAuth.isLoading || profileDocData.isLoading || familyDocData.isLoading) {
      return (
        <Box mx='auto' textAlign='center' mt={20}>
          <CircularProgress size={59} isIndeterminate />
        </Box>
      );
    }

    return children;
  };

  return (
    <ThemeProvider>
      <Navbar />

      {getPageContent()}
    </ThemeProvider>
  );
};

export default AppProvider;
