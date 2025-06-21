import { ProviderProps } from './providerTypes';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
    config: {
        initialColorMode: 'system',
    },
    colors: {
        brand: {
            900: '#1b5e20',
            800: '#43a047',
            700: '#43a047',
        },
    },
    layerStyles: {},
    textStyles: {},
});

const ThemeProvider = ({ children }: ProviderProps) => {
    return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
};

export default ThemeProvider;
