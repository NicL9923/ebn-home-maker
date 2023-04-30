import { MdAccountBalance, MdArticle, MdAttachMoney, MdCreditCard, MdKeyboardArrowDown } from 'react-icons/md';
import React, { useEffect, useState } from 'react';
import Budget from '../src/components/Finances/Budget';
import Savings from '../src/components/Finances/Savings';
import Transactions from '../src/components/Finances/Transactions';
import 'jspdf-autotable';
import { BudgetCategory, IBudget, BudgetSubcategory, Transaction } from '../src/models/types';
import { useUserStore } from '../src/state/UserStore';
import { db, FsCol } from '../src/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import NoBudget from '../src/components/Finances/BudgetComponents/NoBudget';
import {
  Box,
  CircularProgress,
  Heading,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
} from '@chakra-ui/react';

const Finances = () => {
  const toast = useToast();
  const family = useUserStore((state) => state.family);
  const [budget, setBudget] = useState<IBudget | null | undefined>(undefined);

  const processAndSetBudget = (budgetData?: IBudget | null) => {
    if (!budgetData) {
      setBudget(budgetData);
      return;
    }

    const newBudget = { ...budgetData };

    if (!newBudget.categories) {
      console.error('Missing budget categories array!');
      newBudget.categories = [];
    } else {
      newBudget.categories.forEach((cat: BudgetCategory) => {
        cat.currentSpent = 0;
        cat.subcategories.forEach((subcat: BudgetSubcategory) => (subcat.currentSpent = 0));
      });
    }

    if (!newBudget.transactions) {
      console.error('Missing budget categories array!');
      newBudget.transactions = [];
    } else {
      newBudget.transactions.forEach((transaction: Transaction) => {
        const tCatIdx = newBudget.categories.findIndex((budgetCat) => budgetCat.name === transaction.category);
        const tSubCatIdx = newBudget.categories[tCatIdx].subcategories.findIndex(
          (budgetSubcat) => budgetSubcat.name === transaction.subcategory
        );

        // Only count transaction towards this month's budget if it's from this month (unless family setting says otherwise)
        if (
          family?.settings?.showAllTransactionsOnCurrentMonth ||
          new Date(transaction.timestamp).getMonth() === new Date().getMonth()
        ) {
          // Verify cat and subcat were found (i.e. if the transaction has valid ones)
          if (tCatIdx !== -1 && tSubCatIdx !== -1) {
            newBudget.categories[tCatIdx].subcategories[tSubCatIdx].currentSpent += transaction.amt;
          }
        }
      });
    }

    // Handle some calculations we do locally so we can reuse their values (efficiency!)
    let totalSpent = 0;
    let totalAllotted = 0;
    newBudget.categories.forEach((cat: BudgetCategory) => {
      cat.totalAllotted = cat.subcategories.reduce((sum, subcat) => sum + subcat.totalAllotted, 0);
      totalAllotted += cat.totalAllotted;

      cat.currentSpent = cat.subcategories.reduce((sum, subcat) => sum + subcat.currentSpent, 0);
      totalSpent += cat.currentSpent;
    });
    newBudget.totalSpent = totalSpent;
    newBudget.totalAllotted = totalAllotted;

    setBudget(newBudget as IBudget);
  };

  const exportBudgetDataJSON = () => {
    if (!budget) return;

    const fileName = `FinanceData-${new Date()
      .toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
      .replace(' ', '-')}
    `;
    const budgetData = {
      budget: {
        name: budget.name,
        netIncome: budget.monthlyNetIncome,
        totalAllotted: budget.totalAllotted,
        totalSpent: budget.totalSpent,
        categories: [...budget.categories],
      },
      savingsBlobs: [...budget.savingsBlobs],
      transactions: [...budget.transactions],
    };

    const json = JSON.stringify(budgetData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const href = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = href;
    link.download = fileName + '.json';
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  // Budget listener
  useEffect(() => {
    if (family?.budgetId) {
      const unsubscribeBudgetSnapshot = onSnapshot(
        doc(db, FsCol.Budgets, family.budgetId),
        (doc) => {
          processAndSetBudget(doc.exists() ? (doc.data() as IBudget) : null);
        },
        (error) => {
          toast({
            title: `Error getting budget`,
            description: error.message,
            status: 'error',
            isClosable: true,
          });
        }
      );

      return () => unsubscribeBudgetSnapshot();
    }
  }, [family?.budgetId]);

  if (budget === undefined) {
    return (
      <Box mx='auto' textAlign='center' mt={20}>
        <CircularProgress size={59} isIndeterminate />
      </Box>
    );
  }

  if (budget === null) {
    return <NoBudget />;
  }

  return (
    <Box>
      <Stack direction='row' justifyContent='center' alignItems='center'>
        <Heading textAlign='center' mt={2}>
          Finance Dashboard
        </Heading>

        <Menu>
          <MenuButton>
            <IconButton
              icon={<MdKeyboardArrowDown />}
              fontSize={28}
              variant='ghost'
              aria-label='Finance dashboard menu'
            />
          </MenuButton>

          <MenuList>
            <MenuItem icon={<MdArticle />} onClick={exportBudgetDataJSON}>
              Export budget data
            </MenuItem>
          </MenuList>
        </Menu>
      </Stack>

      <Tabs align='center' variant='enclosed' mt={4} colorScheme='green'>
        <TabList>
          <Tab>
            <Icon as={MdAttachMoney} />
            <Text ml={1}>Budget</Text>
          </Tab>

          <Tab>
            <Icon as={MdAccountBalance} />
            <Text ml={1}>Savings</Text>
          </Tab>

          <Tab>
            <Icon as={MdCreditCard} />
            <Text ml={1}>Transactions</Text>
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Budget budget={budget} setBudget={setBudget} />
          </TabPanel>

          <TabPanel>
            <Savings budget={budget} />
          </TabPanel>

          <TabPanel>
            <Transactions budget={budget} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Finances;
