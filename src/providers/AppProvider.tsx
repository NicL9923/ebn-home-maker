import React, { useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import ThemeProvider from 'providers/ThemeProvider';
import { ProviderProps } from 'providers/providerTypes';
import Navbar from 'components/Navbar';
import { useUserStore } from 'state/UserStore';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, FsCol } from '../firebase';
import { Family, Profile } from 'models/types';
import NoProfile from 'components/NoProfile';
import NoFamily from 'components/NoFamily';
import { Box, CircularProgress, useToast } from '@chakra-ui/react';
import LandingPage from 'components/LandingPage';
import { useRouter } from 'next/router';

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

  // Auth listener
  useEffect(() => {
    const unsubscribeAuth = getAuth().onAuthStateChanged((user) => {
      setUserId(user?.uid ?? null);
      setUserEmail(user?.email ?? null);
    });

    return () => unsubscribeAuth();
  }, []);

  // Profile listener
  useEffect(() => {
    if (userId) {
      const unsubscribeProfileSnapshot = onSnapshot(
        doc(db, FsCol.Profiles, userId),
        (doc) => {
          setProfile(doc.exists() ? (doc.data() as Profile) : null);
        },
        (error) => {
          toast({
            title: `Error getting profile`,
            description: error.message,
            status: 'error',
            isClosable: true,
          });
        }
      );

      return () => unsubscribeProfileSnapshot();
    }
  }, [userId]);

  // Family listener
  useEffect(() => {
    if (profile?.familyId) {
      const unsubscribeFamilySnapshot = onSnapshot(
        doc(db, FsCol.Families, profile.familyId),
        (doc) => {
          setFamily(doc.exists() ? (doc.data() as Family) : null);
        },
        (error) => {
          toast({
            title: `Error getting family`,
            description: error.message,
            status: 'error',
            isClosable: true,
          });
        }
      );

      return () => unsubscribeFamilySnapshot();
    }
  }, [profile?.familyId]);

  const getPageContent = () => {
    if (
      router.pathname.includes('login') ||
      router.pathname.includes('signup') ||
      router.pathname.includes('joinFamily')
    ) {
      return children;
    }

    if (userId === null) {
      return <LandingPage />;
    }

    if (profile === null) {
      return <NoProfile />;
    }

    if (family === null) {
      return <NoFamily />;
    }

    if (userId === undefined || profile === undefined || family === undefined) {
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
