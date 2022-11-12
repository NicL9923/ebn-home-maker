import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { useUserStore } from 'state/UserStore';
import { auth } from '../firebase';
import { Avatar, Box, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Text, useToast } from '@chakra-ui/react';

const ProfileIcon = () => {
  const toast = useToast();
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
        <MenuButton
          as={Avatar}
          aria-label='Nav menu'
          src={profile?.imgLink}
          sx={{ cursor: 'pointer' }}
        >
          {!profile?.imgLink && <Text>{profile?.firstName[0].toUpperCase()}</Text>}
        </MenuButton>
        <MenuList>
          <Link href='/profile'>
            <MenuItem>My Profile</MenuItem>
          </Link>

          <MenuDivider />

          <MenuItem onClick={handleSignOut}>Logout</MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
};

export default ProfileIcon;
