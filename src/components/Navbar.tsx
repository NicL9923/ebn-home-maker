import React from 'react';
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
import { IconButton, Menu, MenuList, MenuButton, MenuItem, Stack, Text, Heading, Portal } from '@chakra-ui/react';

const Navbar = () => {
  const userId = useUserStore((state) => state.userId);
  const profile = useUserStore((state) => state.profile);

  return (
    <Stack position='sticky' top='0' direction='row' alignItems='center' p={2} bgColor='green.700' zIndex={10}>
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<MdMenu />}
          variant='ghost'
          fontSize='2xl'
          aria-label='Nav menu'
          color='white'
        />

        <Portal>
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
        </Portal>
      </Menu>

      <Link href='/'>
        <IconButton icon={<MdHome />} variant='ghost' fontSize='2xl' aria-label='Homepage' color='white' />
      </Link>

      <Heading sx={{ flexGrow: 1 }} size='md' color='white'>
        Our Home
      </Heading>

      {userId && profile && <ProfileIcon />}
    </Stack>
  );
};

export default Navbar;
