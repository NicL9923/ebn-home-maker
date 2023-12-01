import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Portal,
  useColorMode,
  useToast,
} from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import { auth } from '../firebase';
import { useUserStore } from '../state/UserStore';
import { signOut } from 'firebase/auth';

const ProfileIcon = () => {
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const profile = useUserStore((state) => state.profile);

  const handleSignOut = () =>
    signOut(auth)
      .then(() => {
        toast({
          title: 'Successfully signed out!',
          status: 'success',
          isClosable: true,
        });
      })
      .catch((error) => {
        toast({
          title: `Error signing out: ${error}`,
          status: 'error',
          isClosable: true,
        });
      });

  return (
    <Box>
      <Menu>
        <MenuButton>
          <Avatar name={profile?.firstName} src={profile?.imgLink} bg='green.400' cursor='pointer' />
        </MenuButton>

        <Portal>
          <MenuList zIndex={15}>
            {profile && (
              <Link to='/profile'>
                <MenuItem>My Profile</MenuItem>
              </Link>
            )}

            <MenuItem onClick={toggleColorMode} icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}>
              {colorMode === 'light' ? 'Dark' : 'Light'} mode
            </MenuItem>

            <MenuDivider />

            <MenuItem onClick={handleSignOut}>Logout</MenuItem>
          </MenuList>
        </Portal>
      </Menu>
    </Box>
  );
};

export default ProfileIcon;
