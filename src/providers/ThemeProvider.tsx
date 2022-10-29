import { createTheme, CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import React from 'react';
import { ProviderProps } from './providerTypes';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { ThemeType } from '../constants';
import { useAppStore } from 'state/AppStore';

const clientSideEmotionCache = createCache({ key: 'css' });

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1b5e20',
    },
    secondary: {
      main: '#43a047',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1b5e20',
    },
    secondary: {
      main: '#43a047',
    },
  },
});

const ThemeProvider = ({ children }: ProviderProps) => {
  const themePreference = useAppStore((state) => state.themePreference);

  return (
    <CacheProvider value={clientSideEmotionCache}>
      <MuiThemeProvider theme={themePreference && themePreference === ThemeType.Dark ? darkTheme : lightTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </CacheProvider>
  );
};

export default ThemeProvider;
