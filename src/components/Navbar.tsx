import {
  Button,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import { MdHome, MdList, MdMenu, MdOutlineEventNote, MdOutlinePayments, MdOutlineSettings } from 'react-icons/md';
import { useUserStore } from '../state/UserStore';
import ProfileIcon from './ProfileIcon';

export const PrimaryElementColor = 'green.700';

const Navbar = () => {
  const userId = useUserStore((state) => state.userId);

  return (
    <Stack
      position='sticky'
      top='0'
      direction='row'
      alignItems='center'
      p={2}
      bgColor={PrimaryElementColor}
      zIndex={10}
    >
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
          <MenuList zIndex={15}>
            <Link to='/grocerylist'>
              <MenuItem icon={<MdList />}>
                <Text>Grocery List</Text>
              </MenuItem>
            </Link>

            <Link to='/finances'>
              <MenuItem icon={<MdOutlinePayments />}>
                <Text>Finances</Text>
              </MenuItem>
            </Link>

            <Link to='/familyboard'>
              <MenuItem icon={<MdOutlineEventNote />}>
                <Text>Family Board</Text>
              </MenuItem>
            </Link>

            <Link to='/maintenance'>
              <MenuItem icon={<MdOutlineSettings />}>
                <Text>Home/Auto Maintenance</Text>
              </MenuItem>
            </Link>
          </MenuList>
        </Portal>
      </Menu>

      <Link to='/'>
        <IconButton icon={<MdHome />} ml={-1} variant='ghost' fontSize='2xl' aria-label='Homepage' color='white' />
      </Link>

      <Heading sx={{ flexGrow: 1 }} size='md' color='white'>
        Home Maker
      </Heading>

      {userId && <ProfileIcon />}
      {userId === null && (
        <Link to='/login'>
          <Button colorScheme='green'>Login</Button>
        </Link>
      )}
    </Stack>
  );
};

export default Navbar;
