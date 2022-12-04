import { db, FsCol } from '../../../firebase';
import { doc, writeBatch } from 'firebase/firestore';
import { IBudget } from 'models/types';
import { useUserStore } from 'state/UserStore';
import { Box, Button, Text } from '@chakra-ui/react';
import { genUuid } from 'utils/utils';

const NoBudget = () => {
  const userId = useUserStore((state) => state.userId);
  const profile = useUserStore((state) => state.profile);

  const batch = writeBatch(db);

  const createAndSaveDefaultBudget = () => {
    if (!userId || !profile) return;

    const newBudgetUuid = genUuid();
    const newBudgetTemplate: IBudget = {
      name: 'My Budget',
      id: newBudgetUuid,
      editors: [userId],
      monthlyNetIncome: 3000,
      categories: [
        {
          name: 'Essentials',
          subcategories: [
            {
              name: 'Rent',
              totalAllotted: 1250,
              currentSpent: 0,
            },
            {
              name: 'Utilities',
              totalAllotted: 300,
              currentSpent: 0,
            },
          ],
        },
        {
          name: 'Lifestyle',
          subcategories: [
            {
              name: 'Spending',
              totalAllotted: 300,
              currentSpent: 0,
            },
          ],
        },
      ],
      savingsBlobs: [{ name: 'Default Blob', currentAmt: 1000 }],
      transactions: [
        {
          id: 0,
          name: 'Default transaction',
          amt: 10,
          category: 'Essentials',
          subcategory: 'Rent',
          timestamp: Date.now().toString(),
        },
      ],
    };

    batch.update(doc(db, FsCol.Families, profile.familyId), { budgetId: newBudgetUuid });
    batch.set(doc(db, FsCol.Budgets, newBudgetUuid), newBudgetTemplate);

    batch.commit();
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
