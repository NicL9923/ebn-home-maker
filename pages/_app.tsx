import React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { firebaseConfig } from '../src/Firebase';
import { initializeApp } from 'firebase/app';
import FirebaseProvider from '../src/providers/FirebaseProvider';
import AppProvider from '../src/providers/AppProvider';

initializeApp(firebaseConfig);

const AppBase = ({ Component, pageProps }: AppProps) => {
  return (
    <FirebaseProvider>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <title>Our Home</title>
        <meta name='description' content='An app to help run a household!' />
      </Head>

      <AppProvider>
        <Component {...pageProps} />
      </AppProvider>
    </FirebaseProvider>
  );
};

export default AppBase;
