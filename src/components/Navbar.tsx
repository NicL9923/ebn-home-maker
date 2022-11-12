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
import { IconButton, Menu, MenuList, MenuButton, MenuItem, Stack, Text, useColorMode } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  const userId = useUserStore((state) => state.userId);
  const profile = useUserStore((state) => state.profile);

  return (
    <Stack position='sticky' direction='row'>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label='Nav menu'
          icon={<MdMenu />}
        />

        <MenuList>
          <Link href='/groceryList'>
            <MenuItem icon={<MdList />}>
              <Text>Grocery List</Text>
            </MenuItem>
          </Link>

          <Link href='/finances'>
            <MenuItem icon={<MdOutlinePayments />}>
              <Text>Finances</Text>
            </MenuItem>
          </Link>

          <Link href='/info'>
            <MenuItem icon={<MdOutlineEventNote />}>
              <Text>Information</Text>
            </MenuItem>
          </Link>

          <Link href='/maintenance'>
            <MenuItem icon={<MdOutlineSettings />}>
              <Text>Home & Auto</Text>
            </MenuItem>
          </Link>

          <Link href='/smarthome'>
            <MenuItem icon={<MdOutlineMemory />}>
              <Text>Smart Home</Text>
            </MenuItem>
          </Link>
        </MenuList>
      </Menu>

      <Link href='/'>
        <IconButton icon={<MdHome />} aria-label='Homepage' />
      </Link>

      <Text sx={{ flexGrow: 1 }}>Our Home</Text>

      <Stack direction='row' alignItems='center'>
        <IconButton
          onClick={toggleColorMode}
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          aria-label='Toggle light and dark mode'
        />

        {userId && profile && <ProfileIcon />}
      </Stack>
    </Stack>
  );
};

export default Navbar;
