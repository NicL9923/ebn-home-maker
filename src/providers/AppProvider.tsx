import { Box, CircularProgress, Flex, Text, useToast } from '@chakra-ui/react';
import { getAuth } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect } from 'react';
import Footer from '../components/Footer';
import LandingPage from '../components/LandingPage';
import Navbar from '../components/Navbar';
import NoFamily from '../components/NoFamily';
import NoProfile from '../components/NoProfile';
import { FsCol, db } from '../firebase';
import { Family, Profile } from '../models/types';
import { useUserStore } from '../state/UserStore';
import ThemeProvider from './ThemeProvider';
import { ProviderProps } from './providerTypes';

// TODO: Consider implementing a more robust route protection system that handles auth states more elegantly: See about handling the routes a little less weirdly when not signed in, etc.

const AppProvider = ({ children }: ProviderProps) => {
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
    }, [setUserEmail, setUserId]);

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
    }, [userId, setProfile, toast]);

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
    }, [profile?.familyId, setFamily, toast]);

    const getPageContent = () => {
        const curPath = window.location.pathname;
        if (curPath.includes('login') || curPath.includes('signup') || curPath.includes('joinFamily')) {
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

                    <Text>
                        {!userId
                            ? 'Fetching login data...'
                            : !profile
                            ? 'Fetching profile data...'
                            : !family
                            ? 'Fetching family data...'
                            : 'This is fine. 🐶🔥'}
                    </Text>
                </Box>
            );
        }

        return children;
    };

    return (
        <ThemeProvider>
            <Flex direction='column' minHeight='100vh' height='fit-content'>
                <Navbar />

                <div style={{ flex: '1 0 50%', marginTop: 2, marginBottom: 8 }}>{getPageContent()}</div>

                <Footer />
            </Flex>
        </ThemeProvider>
    );
};

export default AppProvider;
