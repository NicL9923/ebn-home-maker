import { Box, Button, Text } from '@chakra-ui/react';
import Client from '../../../Client';
import { useUserStore } from '../../../state/UserStore';

const NoBudget = () => {
  const userId = useUserStore((state) => state.userId);
  const profile = useUserStore((state) => state.profile);

  const createAndSaveDefaultBudget = () => {
    if (!userId || !profile) return;

    Client.createNewBudget(userId, profile.familyId);
  };

  return (
    <Box p={2} maxWidth='sm' textAlign='center' mt={4} mx='auto'>
      <Text>You don&apos;t have a budget yet!</Text>
      <Text mb={4}>Create one?</Text>

      <Button onClick={createAndSaveDefaultBudget}>Create Budget</Button>
    </Box>
  );
};

export default NoBudget;
