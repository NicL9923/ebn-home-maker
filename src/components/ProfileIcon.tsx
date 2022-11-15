import React from 'react';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { useUserStore } from 'state/UserStore';
import { auth } from '../firebase';
import {
  Avatar,
  Box,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  useToast,
  useColorMode,
  Portal,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';

const ProfileIcon = () => {
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const profile = useUserStore((state) => state.profile);

  const handleSignOut = () =>
    signOut(auth)
      .then(() => {
        toast({
          title: 'Successfully signed out!',
          status: 'success',
          isClosable: true,
        });
      })
      .catch((error) => {
        toast({
          title: `Error signing out: ${error}`,
          status: 'error',
          isClosable: true,
        });
      });

  return (
    <Box>
      <Menu>
        <MenuButton>
          <Avatar name={profile?.firstName} src={profile?.imgLink} bg='green.400' cursor='pointer' />
        </MenuButton>

        <Portal>
          <MenuList>
            <Link href='/profile'>
              <MenuItem>My Profile</MenuItem>
            </Link>

            <MenuItem onClick={toggleColorMode} icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}>
              {colorMode === 'light' ? 'Dark' : 'Light'} mode
            </MenuItem>

            <MenuDivider />

            <MenuItem onClick={handleSignOut}>Logout</MenuItem>
          </MenuList>
        </Portal>
      </Menu>
    </Box>
  );
};

export default ProfileIcon;
