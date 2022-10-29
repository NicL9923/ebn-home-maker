import React, { useState } from 'react';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import ProfileIcon from './ProfileIcon';
import {
  AppBar,
  FormControlLabel,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Switch,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ListIcon from '@mui/icons-material/List';
import { Home } from '@mui/icons-material';
import Link from 'next/link';
import { localStorageThemeTypeKey, ThemeType } from '../constants';
import { useUserStore } from 'state/UserStore';
import { useAppStore } from 'state/AppStore';

const Navbar = () => {
  const themePreference = useAppStore((state) => state.themePreference);
  const setThemePreference = useAppStore((state) => state.setThemePreference);
  const userId = useUserStore((state) => state.userId);
  const profile = useUserStore((state) => state.profile);

  const [anchorEl, setAnchorEl] = useState<Element | undefined>(undefined);

  const updateThemePreference = (isChecked: boolean) => {
    const newThemePreference = isChecked ? ThemeType.Light : ThemeType.Dark;

    if (typeof window !== 'undefined') {
      localStorage.setItem(localStorageThemeTypeKey, newThemePreference);
    }

    setThemePreference(newThemePreference);
  };

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
        <Menu id='menu-appbar' anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(undefined)}>
          <Link href='/groceryList'>
            <MenuItem onClick={() => setAnchorEl(undefined)}>
              <ListItemIcon>
                <ListIcon />
              </ListItemIcon>
              <ListItemText>Grocery List</ListItemText>
            </MenuItem>
          </Link>

          <Link href='/finances'>
            <MenuItem onClick={() => setAnchorEl(undefined)}>
              <ListItemIcon>
                <PaymentsOutlinedIcon />
              </ListItemIcon>
              <ListItemText>Finances</ListItemText>
            </MenuItem>
          </Link>

          <Link href='/info'>
            <MenuItem onClick={() => setAnchorEl(undefined)}>
              <ListItemIcon>
                <EventNoteOutlinedIcon />
              </ListItemIcon>
              <ListItemText>Information</ListItemText>
            </MenuItem>
          </Link>

          <Link href='/maintenance'>
            <MenuItem onClick={() => setAnchorEl(undefined)}>
              <ListItemIcon>
                <SettingsOutlinedIcon />
              </ListItemIcon>
              <ListItemText>Home & Auto</ListItemText>
            </MenuItem>
          </Link>

          <Link href='/smarthome'>
            <MenuItem onClick={() => setAnchorEl(undefined)}>
              <ListItemIcon>
                <MemoryOutlinedIcon />
              </ListItemIcon>
              <ListItemText>Smart Home</ListItemText>
            </MenuItem>
          </Link>
        </Menu>

        <Link href='/'>
          <IconButton size='large' color='inherit'>
            <Home />
          </IconButton>
        </Link>
        <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
          Our Home
        </Typography>

        <Stack direction='row' alignItems='center'>
          <FormControlLabel
            control={
              <Switch
                checked={themePreference === ThemeType.Light ? true : false}
                onChange={(_e, checked) => updateThemePreference(checked)}
              />
            }
            label={themePreference && themePreference === ThemeType.Light ? 'Light mode' : 'Dark mode'}
          />

          {userId && profile && <ProfileIcon />}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
