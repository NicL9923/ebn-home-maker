import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { useUserStore } from 'state/UserStore';
import { auth } from '../firebase';
import { Avatar, Divider, Menu, MenuItem, Text, useToast } from '@chakra-ui/react';

const ProfileIcon = () => {
  const toast = useToast();
  const profile = useUserStore((state) => state.profile);

  const [anchorEl, setAnchorEl] = useState<Element | undefined>(undefined);

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
    <div>
      <Avatar
        id='profile-button'
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-haspopup='true'
        aria-expanded={anchorEl ? 'true' : undefined}
        aria-controls='profile-menu'
        src={profile?.imgLink ? profile.imgLink : undefined}
        sx={{ cursor: 'pointer' }}
      >
        {!profile?.imgLink && <Text>{profile?.firstName[0].toUpperCase()}</Text>}
      </Avatar>

      <Menu id='profile-menu' isOpen={!!anchorEl} onClose={() => setAnchorEl(undefined)}>
        <Link href='/profile'>
          <MenuItem onClick={() => setAnchorEl(undefined)}>
            <Text>My Profile</Text>
          </MenuItem>
        </Link>

        <Divider />

        <MenuItem
          onClick={() => {
            setAnchorEl(undefined);
            handleSignOut();
          }}
        >
          <Text>Logout</Text>
        </MenuItem>
      </Menu>
    </div>
  );
};

export default ProfileIcon;
