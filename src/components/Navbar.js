import React, { useState } from 'react';
import { signInWithRedirect, GoogleAuthProvider } from 'firebase/auth';
import { Link } from 'react-router-dom';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import ProfileIcon from '../components/ProfileIcon';
import { AppBar, Button, IconButton, Menu, MenuItem, Stack, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Home } from '@mui/icons-material';

const Navbar = (props) => {
  const { profile, user, auth } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const provider = new GoogleAuthProvider();

  const googleSignIn = () => signInWithRedirect(auth, provider);

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
                <MenuItem onClick={() => setAnchorEl(null)}>
                    <Link to='/smarthome'>
                        <Stack direction='row' spacing={1}>
                            <MemoryOutlinedIcon />
                            <h4>Smarthome</h4>
                        </Stack>
                    </Link>
                </MenuItem>
                <MenuItem onClick={() => setAnchorEl(null)}>
                    <Link to='/budget'>
                        <Stack direction='row' spacing={1}>
                            <PaymentsOutlinedIcon />
                            <h4>Budget</h4>
                        </Stack>
                    </Link>
                </MenuItem>
                <MenuItem onClick={() => setAnchorEl(null)}>
                    <Link to='/info'>
                        <Stack direction='row' spacing={1}>
                            <EventNoteOutlinedIcon />
                            <h4>Information</h4>
                        </Stack>
                    </Link>
                </MenuItem>
                <MenuItem onClick={() => setAnchorEl(null)}>
                    <Link to='/maintenance'>
                        <Stack direction='row' spacing={1}>
                            <SettingsOutlinedIcon />
                            <h4>Maintenance</h4>
                        </Stack>
                    </Link>
                </MenuItem>
            </Menu>

            <IconButton size='large' color='inherit' component={Link} to='/'><Home /></IconButton>
            <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>Our Home</Typography>

            {user && profile && <ProfileIcon imgLink={profile.imgLink} />}
            {!user && <Button onClick={googleSignIn}>Login</Button>}
        </Toolbar>
    </AppBar>
  );
}

export default Navbar;