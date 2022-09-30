import React from 'react';
import { createRoot } from 'react-dom/client';
import { initializeApp } from 'firebase/app';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { firebaseConfig, FirebaseContext, FirebaseManager } from './Firebase';

initializeApp(firebaseConfig);

const rootContainer = document.getElementById('root') as HTMLElement;
const root = createRoot(rootContainer);

root.render(
  <FirebaseContext.Provider value={new FirebaseManager()}>
    <App />
  </FirebaseContext.Provider>
);

serviceWorkerRegistration.register();
