import React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import AppProvider from '../src/providers/AppProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const AppBase = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <title>Home Maker</title>
        <meta name='description' content="Home Maker helps you run your household so it doesn't run you" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <Component {...pageProps} />
        </AppProvider>
      </QueryClientProvider>
    </>
  );
};

export default AppBase;
