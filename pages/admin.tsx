import React from 'react';
import { useUserStore } from '../src/state/UserStore';
import { auth, db, FsCol } from '../src/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Box, Container, Heading, Text, useToast } from '@chakra-ui/react';

const AdminPage = () => {
  const toast = useToast();
  const userId = useUserStore((state) => state.userId);

  if (!userId || userId === process.env.NEXT_PUBLIC_ADMIN_USER_ID) {
    return null;
  }

  return (
    <Container>
      <Box mb={4} p={3}>
        <Heading>Admin Portal</Heading>

        <Text>TODO</Text>

        <Text>Select operation, enter collection, provide any applicable operation data, and big red button</Text>
      </Box>
    </Container>
  );
};

export default AdminPage;
