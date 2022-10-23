import { useMediaQuery, createTheme, CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { UserContext } from 'providers/AppProvider';
import React, { useContext } from 'react';
import { ProviderProps } from './type';

const ThemeProvider = ({ children }: ProviderProps) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const { profile } = useContext(UserContext);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: profile?.theme ? profile.theme : prefersDarkMode ? 'dark' : 'light',
          primary: {
            main: '#1b5e20',
          },
          secondary: {
            main: '#43a047',
          },
        },
      }),
    [prefersDarkMode, profile?.theme]
  );

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider;
