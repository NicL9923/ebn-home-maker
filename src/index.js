import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import { initializeApp } from 'firebase/app';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
const firebaseConfig = {
  apiKey: "AIzaSyBEokTSCPR2Cw-o5pKAUwTK8vlmNaIAASk",
  authDomain: "our-home-239c1.firebaseapp.com",
  projectId: "our-home-239c1",
  storageBucket: "our-home-239c1.appspot.com",
  messagingSenderId: "613377018757",
  appId: "1:613377018757:web:ebbb3c902c79b01aabd2ec"
};

initializeApp(firebaseConfig);

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

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);