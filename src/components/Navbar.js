import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import ProfileIcon from '../components/ProfileIcon';
import { AppBar, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Home } from '@mui/icons-material';

const Navbar = (props) => {
  const { profile, user, auth } = props;
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <AppBar position='static'>
        <Toolbar>
            <IconButton
                size='large'
                edge='start'
                onClick={(event) => setAnchorEl(event.currentTarget)}
                aria-label='menu'
                aria-haspopup='true'
                color='inherit'
                aria-expanded={anchorEl ? 'true' : undefined}
                aria-controls='menu-appbar'
            >
                <MenuIcon />
            </IconButton>
            <Menu
                id='menu-appbar'
                anchorEl={anchorEl}
                open={anchorEl ? anchorEl : false}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem onClick={() => setAnchorEl(null)} component={Link} to='/smarthome'>
                    <ListItemIcon><MemoryOutlinedIcon /></ListItemIcon>
                    <ListItemText>Smarthome</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => setAnchorEl(null)} component={Link} to='/budget'>
                    <ListItemIcon><PaymentsOutlinedIcon /></ListItemIcon>
                    <ListItemText>Budget</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => setAnchorEl(null)} component={Link} to='/info'>
                    <ListItemIcon><EventNoteOutlinedIcon /></ListItemIcon>
                    <ListItemText>Information</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => setAnchorEl(null)} component={Link} to='/maintenance'>
                    <ListItemIcon><SettingsOutlinedIcon /></ListItemIcon>
                    <ListItemText>Maintenance</ListItemText>
                </MenuItem>
            </Menu>

            <IconButton size='large' color='inherit' component={Link} to='/'><Home /></IconButton>
            <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>Our Home</Typography>

            {user && profile &&
                <ProfileIcon profile={profile} auth={auth} />
            }
        </Toolbar>
    </AppBar>
  );
}

export default Navbar;