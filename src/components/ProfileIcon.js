import React, { useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { Avatar, Divider, Menu, MenuItem } from '@mui/material';

const ProfileIcon = (props) => {
  const auth = getAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleSignOut = () => signOut(auth).then(() => {
    console.log("Successfully signed out");
  }).catch(error => {
    console.error("Error signing out: " + error);
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
          src={props.imgLink}
          alt='profile'
        />

        <Menu
          id='profile-menu'
          anchorEl={anchorEl}
          open={anchorEl}
          onClose={() => setAnchorEl(null)}
          MenuListProps={{ 'aria-labelledby': 'profile-button' }}
        >
          <MenuItem onClick={() => setAnchorEl(null)}><Link to='/profile'>My Profile</Link></MenuItem>
          <Divider />
          <MenuItem onClick={() => { setAnchorEl(null); handleSignOut(); }}>Sign Out</MenuItem>
        </Menu>
      </div>
    </div>
  );
}

export default ProfileIcon;
