import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import 'dotenv/config';
import express from 'express';

import { initializeApp } from 'firebase/app';
const firebaseConfig = {
  apiKey: "AIzaSyBEokTSCPR2Cw-o5pKAUwTK8vlmNaIAASk",
  authDomain: "our-home-239c1.firebaseapp.com",
  projectId: "our-home-239c1",
  storageBucket: "our-home-239c1.appspot.com",
  messagingSenderId: "613377018757",
  appId: "1:613377018757:web:ebbb3c902c79b01aabd2ec"
};

const app = initializeApp(firebaseConfig);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);