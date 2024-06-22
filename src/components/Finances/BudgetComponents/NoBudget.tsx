import { Box, Button, Text } from '@chakra-ui/react';
import { doc, writeBatch } from 'firebase/firestore';
import { db, FsCol } from '../../../firebase';
import { IBudget } from '../../../models/types';
import { useUserStore } from '../../../state/UserStore';
import { genUuid } from '../../../utils/utils';

const NoBudget = () => {
  const userId = useUserStore((state) => state.userId);
  const profile = useUserStore((state) => state.profile);

  const batch = writeBatch(db);

  const createAndSaveDefaultBudget = () => {
    if (!userId || !profile) return;

    const newBudgetUuid = genUuid();
    const newBudgetTemplate: IBudget = {
      uid: newBudgetUuid,
      editors: [userId],
      monthlyNetIncome: 3000,
      categories: [
        {
          uid: genUuid(),
          name: 'Essentials',
          subcategories: [
            {
              uid: genUuid(),
              name: 'Rent',
              totalAllotted: 1250,
              currentSpent: 0,
            },
            {
              uid: genUuid(),
              name: 'Utilities',
              totalAllotted: 300,
              currentSpent: 0,
            },
          ],
        },
        {
          uid: genUuid(),
          name: 'Lifestyle',
          subcategories: [
            {
              uid: genUuid(),
              name: 'Spending',
              totalAllotted: 300,
              currentSpent: 0,
            },
          ],
        },
      ],
      savingsBlobs: [{ uid: genUuid(), name: 'Default Blob', currentAmt: 1000 }],
      transactions: [
        {
          uid: genUuid(),
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
