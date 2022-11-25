import React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import AppProvider from '../src/providers/AppProvider';

const AppBase = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <title>EBN - Home Maker</title>
        <meta
          name='description'
          content="Explorers by Nature's Home Maker app lets you stay on top of your household so that it doesn't run you."
        />
      </Head>

      <AppProvider>
        <Component {...pageProps} />
      </AppProvider>
    </>
  );
};

export default AppBase;
