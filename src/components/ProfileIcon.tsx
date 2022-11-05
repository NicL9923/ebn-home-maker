import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { Avatar, Divider, ListItemText, Menu, MenuItem, Typography } from '@mui/material';
import Link from 'next/link';
import { useUserStore } from 'state/UserStore';
import { auth } from '../firebase';
import { useToast } from '@chakra-ui/react';

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
        alt='profile'
        sx={{ cursor: 'pointer' }}
      >
        {!profile?.imgLink && <Typography variant='h6'>{profile?.firstName[0].toUpperCase()}</Typography>}
      </Avatar>

      <Menu
        id='profile-menu'
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(undefined)}
        MenuListProps={{ 'aria-labelledby': 'profile-button' }}
      >
        <Link href='/profile'>
          <MenuItem onClick={() => setAnchorEl(undefined)}>
            <ListItemText>My Profile</ListItemText>
          </MenuItem>
        </Link>

        <Divider />

        <MenuItem
          onClick={() => {
            setAnchorEl(undefined);
            handleSignOut();
          }}
        >
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </div>
  );
};

export default ProfileIcon;
