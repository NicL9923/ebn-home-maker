import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import ProfileIcon from './ProfileIcon';
import { AppBar, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ListIcon from '@mui/icons-material/List';
import { Home } from '@mui/icons-material';
import { UserContext } from '../App';

const Navbar = (): JSX.Element => {
  const { userId, profile } = useContext(UserContext);
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  return (
    <AppBar position='sticky' sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
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
        <Menu id='menu-appbar' anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => setAnchorEl(null)} component={Link} to='/smarthome'>
            <ListItemIcon>
              <MemoryOutlinedIcon />
            </ListItemIcon>
            <ListItemText>Smart Home</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)} component={Link} to='/finances'>
            <ListItemIcon>
              <PaymentsOutlinedIcon />
            </ListItemIcon>
            <ListItemText>Finances</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)} component={Link} to='/grocerylist'>
            <ListItemIcon>
              <ListIcon />
            </ListItemIcon>
            <ListItemText>Grocery List</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)} component={Link} to='/info'>
            <ListItemIcon>
              <EventNoteOutlinedIcon />
            </ListItemIcon>
            <ListItemText>Information</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)} component={Link} to='/maintenance'>
            <ListItemIcon>
              <SettingsOutlinedIcon />
            </ListItemIcon>
            <ListItemText>Maintenance</ListItemText>
          </MenuItem>
        </Menu>

        <IconButton size='large' color='inherit' component={Link} to='/'>
          <Home />
        </IconButton>
        <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
          Our Home
        </Typography>

        {userId && profile && <ProfileIcon />}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;