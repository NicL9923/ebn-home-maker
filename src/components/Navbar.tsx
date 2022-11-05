import React, { useState } from 'react';
import {
  MdMenu,
  MdList,
  MdHome,
  MdOutlineMemory,
  MdOutlineSettings,
  MdOutlinePayments,
  MdOutlineEventNote,
} from 'react-icons/md';
import ProfileIcon from './ProfileIcon';
import Link from 'next/link';
import { useUserStore } from 'state/UserStore';
import { Box, IconButton, Menu, MenuItem, Stack, Text, useColorMode } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  const userId = useUserStore((state) => state.userId);
  const profile = useUserStore((state) => state.profile);

  const [anchorEl, setAnchorEl] = useState<Element | undefined>(undefined);

  return (
    <Box position='sticky' sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <IconButton
        icon={<MdMenu />}
        size='large'
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-label='menu'
        aria-haspopup='true'
        color='inherit'
        aria-expanded={anchorEl ? 'true' : undefined}
        aria-controls='menu-appbar'
      />
      <Menu id='menu-appbar' isOpen={!!anchorEl} onClose={() => setAnchorEl(undefined)}>
        <Link href='/groceryList'>
          <MenuItem icon={<MdList />} onClick={() => setAnchorEl(undefined)}>
            <Text>Grocery List</Text>
          </MenuItem>
        </Link>

        <Link href='/finances'>
          <MenuItem icon={<MdOutlinePayments />} onClick={() => setAnchorEl(undefined)}>
            <Text>Finances</Text>
          </MenuItem>
        </Link>

        <Link href='/info'>
          <MenuItem icon={<MdOutlineEventNote />} onClick={() => setAnchorEl(undefined)}>
            <Text>Information</Text>
          </MenuItem>
        </Link>

        <Link href='/maintenance'>
          <MenuItem icon={<MdOutlineSettings />} onClick={() => setAnchorEl(undefined)}>
            <Text>Home & Auto</Text>
          </MenuItem>
        </Link>

        <Link href='/smarthome'>
          <MenuItem icon={<MdOutlineMemory />} onClick={() => setAnchorEl(undefined)}>
            <Text>Smart Home</Text>
          </MenuItem>
        </Link>
      </Menu>

      <Link href='/'>
        <IconButton icon={<MdHome />} size='large' color='inherit' aria-label='Homepage' />
      </Link>
      <Text variant='h6' sx={{ flexGrow: 1 }}>
        Our Home
      </Text>

      <Stack direction='row' alignItems='center'>
        <IconButton
          onClick={toggleColorMode}
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          aria-label='Toggle light and dark mode'
        />

        {userId && profile && <ProfileIcon />}
      </Stack>
    </Box>
  );
};

export default Navbar;
