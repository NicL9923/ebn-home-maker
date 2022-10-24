import { createTheme, CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import React, { useContext } from 'react';
import { ProviderProps } from './providerTypes';
import { AppContext } from './AppProvider';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { ThemeType } from '../constants';

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
  const { themePreference } = useContext(AppContext);

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
