import React, { useContext, useState } from 'react';
import { signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { Avatar, Divider, ListItemText, Menu, MenuItem, Typography } from '@mui/material';
import { FirebaseContext } from '../Firebase';
import { UserContext } from '../App';

const ProfileIcon = (): JSX.Element => {
  const { auth } = useContext(FirebaseContext);
  const { profile } = useContext(UserContext);
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const handleSignOut = () =>
    signOut(auth)
      .then(() => {
        console.log('Successfully signed out');
      })
      .catch((error) => {
        console.error('Error signing out: ' + error);
      });

  return (
    <div className='flex flex-row justify-end'>
      <div>
        <Avatar
          id='profile-button'
          onClick={(event) => setAnchorEl(event.currentTarget)}
          aria-haspopup='true'
          aria-expanded={anchorEl ? 'true' : undefined}
          aria-controls='profile-menu'
          src={profile && profile.imgLink ? profile.imgLink : undefined}
          alt='profile'
          sx={{ cursor: 'pointer' }}
        >
          {profile &&
            (profile.imgLink ? undefined : <Typography variant='h6'>{profile.firstName[0].toUpperCase()}</Typography>)}
        </Avatar>

        <Menu
          id='profile-menu'
          anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={() => setAnchorEl(null)}
          MenuListProps={{ 'aria-labelledby': 'profile-button' }}
        >
          <MenuItem onClick={() => setAnchorEl(null)} component={Link} to='/profile'>
            <ListItemText>My Profile</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              handleSignOut();
            }}
          >
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export default ProfileIcon;
