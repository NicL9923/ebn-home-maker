import React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import AppProvider from '../src/providers/AppProvider';

const AppBase = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <title>Our Home</title>
        <meta name='description' content='An app to help run a household!' />
      </Head>

      <AppProvider>
        <Component {...pageProps} />
      </AppProvider>
    </>
  );
};

export default AppBase;
