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
import { doc, onSnapshot } from 'firebase/firestore';
import 'jspdf-autotable';
import { useCallback, useEffect, useState } from 'react';
import { MdAccountBalance, MdArticle, MdAttachMoney, MdCreditCard, MdKeyboardArrowDown } from 'react-icons/md';
import Budget from '../components/Finances/Budget';
import NoBudget from '../components/Finances/BudgetComponents/NoBudget';
import Savings from '../components/Finances/Savings';
import Transactions from '../components/Finances/Transactions';
import { FsCol, db } from '../firebase';
import { BudgetCategory, BudgetSubcategory, IBudget, Transaction } from '../models/types';
import { useUserStore } from '../state/UserStore';

const Finances = () => {
  const toast = useToast();
  const family = useUserStore((state) => state.family);
  const [budget, setBudget] = useState<IBudget | null | undefined>();
  const [curBudgetMonthAndYear, setBudgetCurMonthAndYear] = useState<Date>(new Date());

  const processAndSetBudget = useCallback(
    (budgetData?: IBudget | null) => {
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

          // Only count transaction towards this month's budget if it's from this month/year (unless family setting says otherwise)
          const transactionDate = new Date(transaction.timestamp);
          const transactionIsInCurrentMonthYear =
            transactionDate.getMonth() === curBudgetMonthAndYear.getMonth() &&
            transactionDate.getFullYear() === curBudgetMonthAndYear.getFullYear();
          if (family?.settings?.showAllTransactionsOnCurrentMonth || transactionIsInCurrentMonthYear) {
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
    },
    [family?.settings?.showAllTransactionsOnCurrentMonth, curBudgetMonthAndYear]
  );

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
  }, [family?.budgetId, processAndSetBudget, toast]);

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
      <Stack direction='row' justifyContent='center' mt={2}>
        <Heading textAlign='center'>Finance Dashboard</Heading>

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
            <Budget
              budget={budget}
              setBudget={setBudget}
              curBudgetMonthAndYear={curBudgetMonthAndYear}
              setBudgetCurMonthAndYear={setBudgetCurMonthAndYear}
            />
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
