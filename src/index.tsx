import React from 'react';
import { createRoot } from 'react-dom/client';
import { initializeApp } from 'firebase/app';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { firebaseConfig, FirebaseContext, FirebaseManager } from './Firebase';

initializeApp(firebaseConfig);

const theme = createTheme({
  palette: {
    primary: {
      main: '#1b5e20',
    },
    secondary: {
      main: '#43a047',
    },
  },
});

const rootContainer = document.getElementById('root') as HTMLElement;
const root = createRoot(rootContainer);

root.render(
  <ThemeProvider theme={theme}>
    <FirebaseContext.Provider value={new FirebaseManager()}>
      <CssBaseline />
      <App />
    </FirebaseContext.Provider>
  </ThemeProvider>
);

serviceWorkerRegistration.register();
