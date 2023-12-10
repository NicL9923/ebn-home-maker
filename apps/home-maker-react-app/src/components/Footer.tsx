import { ButtonGroup, Container, Divider, IconButton, Stack, Text } from '@chakra-ui/react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { MdHome } from 'react-icons/md';
import { PrimaryElementColor } from './Navbar';

// Major TODOs...

const Footer = () => {
  return (
    <Stack bgColor={PrimaryElementColor} mt={8}>
      <Container as='footer' role='contentinfo' py={8}>
        <Stack spacing={4}>
          <Stack justify='space-between' direction='row' align='center'>
            <Stack direction='row' align='center'>
              <MdHome fontSize={18} />

              <Text fontSize='large'>Home Maker</Text>
            </Stack>

            <ButtonGroup variant='tertiary'>
              <IconButton as='a' href='facebook.com' aria-label='Facebook' icon={<FaFacebook />} />
              <IconButton as='a' href='instagram.com' aria-label='Instagram' icon={<FaInstagram />} />
            </ButtonGroup>
          </Stack>

          <Stack direction='row' justify='center' align='center' height={6}>
            <Text>Support request</Text>
            <Divider orientation='vertical' />
            <Text>Submit feedback</Text>
          </Stack>

          <Stack justify='space-between' direction='row' align='center' mt={4}>
            <Text fontSize='sm' color='fg.subtle'>
              &copy; {new Date().getFullYear()} Explorers by Nature, LLC
            </Text>

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
        </Stack>
      </Container>
    </Stack>
  );
};

export default Footer;
