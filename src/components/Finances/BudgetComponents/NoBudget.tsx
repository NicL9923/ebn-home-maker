import { useFirestoreWriteBatch } from '@react-query-firebase/firestore';
import { db, FsCol } from '../../../firebase';
import { doc, writeBatch } from 'firebase/firestore';
import { IBudget } from 'models/types';
import { useUserStore } from 'state/UserStore';
import { v4 as uuidv4 } from 'uuid';
import { Box, Button, Text } from '@chakra-ui/react';

const NoBudget = () => {
  const userId = useUserStore((state) => state.userId);
  const profile = useUserStore((state) => state.profile);

  const batch = writeBatch(db);
  const batchMutation = useFirestoreWriteBatch(batch);

  const createAndSaveDefaultBudget = () => {
    if (!userId || !profile) return;

    const newBudgetUuid = uuidv4();
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

    batchMutation.mutate();
  };

  return (
    <Box p={2} maxWidth='sm' textAlign='center' mt={4} mx='auto'>
      <Text variant='h6'>You don&apos;t have a budget yet!</Text>
      <Text variant='subtitle1' mb={4}>
        Create one?
      </Text>

      <Button variant='contained' onClick={createAndSaveDefaultBudget} disabled={batchMutation.isLoading}>
        Create Budget
      </Button>
    </Box>
  );
};

export default NoBudget;
