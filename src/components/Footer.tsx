import { Container, Divider, Stack, Text } from '@chakra-ui/react';
import { PrimaryElementColor } from './Navbar';

const Footer = () => {
  return (
    <Stack bgColor={PrimaryElementColor}>
      <Container as='footer' role='contentinfo' py={2}>
        <Stack spacing={4}>
          <Stack direction='row' justify='center' align='center' height={4}>
            <Text fontSize='sm' color='fg.subtle'>
              &copy; {new Date().getFullYear()} Explorers by Nature, LLC
            </Text>
          </Stack>

          <Stack direction='row' justify='center' align='center' height={4}>
            <Text fontSize='x-small' color='fg.subtle'>
              Privacy Policy
            </Text>
            <Divider orientation='vertical' />
            <Text fontSize='x-small' color='fg.subtle'>
              Terms of Service
            </Text>
          </Stack>
        </Stack>
      </Container>
    </Stack>
  );
};

export default Footer;
