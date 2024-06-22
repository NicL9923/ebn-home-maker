import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: 'our-home-239c1.firebaseapp.com',
  projectId: 'our-home-239c1',
  storageBucket: 'our-home-239c1.appspot.com',
  messagingSenderId: '613377018757',
  appId: '1:613377018757:web:ebbb3c902c79b01aabd2ec',
};

const firebase = initializeApp(firebaseConfig);

export const auth = getAuth(firebase);
export const db = getFirestore(firebase);
export const storage = getStorage(firebase);

export const FsCol = {
  Budgets: 'budgets',
  Families: 'families',
  Profiles: 'profiles',
  Residences: 'residences',
  Vehicles: 'vehicles',
};
