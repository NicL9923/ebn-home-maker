import { createTheme, CssBaseline, ThemeProvider as MuiThemeProvider, PaletteMode } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { ProviderProps } from './providerTypes';
import { AppContext } from './AppProvider';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

const clientSideEmotionCache = createCache({ key: 'css' });

const ThemeProvider = ({ children }: ProviderProps) => {
  const { themePreference } = useContext(AppContext);
  const [theme, setTheme] = useState(
    createTheme({
      palette: {
        primary: {
          main: '#1b5e20',
        },
        secondary: {
          main: '#43a047',
        },
      },
    })
  );

  useEffect(() => {
    setTheme(
      createTheme({
        palette: {
          mode: themePreference as PaletteMode,
          primary: {
            main: '#1b5e20',
          },
          secondary: {
            main: '#43a047',
          },
        },
      })
    );
  }, [themePreference]);

  return (
    <CacheProvider value={clientSideEmotionCache}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </CacheProvider>
  );
};

export default ThemeProvider;
