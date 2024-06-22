import AppProvider from './providers/AppProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ColorModeScript } from '@chakra-ui/react';
import { theme } from './providers/ThemeProvider';
import { Outlet } from '@tanstack/react-router';

const queryClient = new QueryClient();

const App = (): JSX.Element => {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <Outlet />
        </AppProvider>
      </QueryClientProvider>
    </>
  );
};

export default App;
