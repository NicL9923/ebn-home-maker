import React, { useContext, useState } from 'react';
import { signOut } from 'firebase/auth';
import { Avatar, Divider, ListItemText, Menu, MenuItem, Typography } from '@mui/material';
import { UserContext, AppContext } from 'providers/AppProvider';
import { FirebaseContext } from 'providers/FirebaseProvider';
import Link from 'next/link';

const ProfileIcon = () => {
  const { setSnackbarData } = useContext(AppContext);
  const { auth } = useContext(FirebaseContext);
  const { profile } = useContext(UserContext);

  const [anchorEl, setAnchorEl] = useState<Element | undefined>(undefined);

  const handleSignOut = () =>
    signOut(auth)
      .then(() => {
        setSnackbarData({ msg: 'Successfully signed out!', severity: 'success' });
      })
      .catch((error) => {
        setSnackbarData({ msg: `Error signing out: ${error}`, severity: 'error' });
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
