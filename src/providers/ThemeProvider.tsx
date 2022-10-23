import { createTheme, CssBaseline, ThemeProvider as MuiThemeProvider, PaletteMode } from '@mui/material';
import React, { useContext } from 'react';
import { ProviderProps } from './providerTypes';
import { AppContext } from './AppProvider';

const ThemeProvider = ({ children }: ProviderProps) => {
  const { themePreference } = useContext(AppContext);

  const theme = React.useMemo(
    () =>
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
      }),
    [themePreference]
  );

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider;
