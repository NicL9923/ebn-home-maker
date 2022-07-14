import React from 'react';
import { createRoot } from 'react-dom/client';
import { initializeApp } from 'firebase/app';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import App from './App';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const firebaseConfig = {
  apiKey: "AIzaSyBEokTSCPR2Cw-o5pKAUwTK8vlmNaIAASk",
  authDomain: "our-home-239c1.firebaseapp.com",
  projectId: "our-home-239c1",
  storageBucket: "our-home-239c1.appspot.com",
  messagingSenderId: "613377018757",
  appId: "1:613377018757:web:ebbb3c902c79b01aabd2ec"
};
initializeApp(firebaseConfig);
export const FirebaseContext = React.createContext(null);

const theme = createTheme({
  palette: {
    primary: {
      main: '#1b5e20'
    },
    secondary: {
      main: '#43a047'
    }
  }
});

const rootContainer = document.getElementById('root');
const root = createRoot(rootContainer);

root.render(
  <ThemeProvider theme={theme}>
    <FirebaseContext.Provider value={{ auth: getAuth(), db: getFirestore() }}>
      <CssBaseline />
      <App />
    </FirebaseContext.Provider>
  </ThemeProvider>
);

serviceWorkerRegistration.register();