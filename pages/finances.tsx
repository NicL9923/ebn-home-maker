import { MdAccountBalance, MdArticle, MdAttachMoney, MdCreditCard } from 'react-icons/md';
import React, { useEffect, useState } from 'react';
import Budget from '../src/components/Finances/Budget';
import Savings from '../src/components/Finances/Savings';
import Transactions from '../src/components/Finances/Transactions';
import 'jspdf-autotable';
import { BudgetCategory, IBudget, BudgetSubcategory, Transaction } from 'models/types';
import { useUserStore } from 'state/UserStore';
import { useFirestoreDocument } from '@react-query-firebase/firestore';
import { db, FsCol } from '../src/firebase';
import { doc } from 'firebase/firestore';
import NoBudget from 'components/Finances/BudgetComponents/NoBudget';
import {
  Box,
  Button,
  CircularProgress,
  Heading,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';

const Finances = () => {
  const family = useUserStore((state) => state.family);
  const [budget, setBudget] = useState<IBudget | undefined>(undefined);

  const budgetDoc = useFirestoreDocument(
    [FsCol.Budgets, family?.budgetId ?? 'undefined'],
    doc(db, FsCol.Budgets, family?.budgetId ?? 'undefined'),
    {
      subscribe: true,
    }
  );

  const processAndSetBudget = (budgetData?: IBudget) => {
    if (!budgetData) {
      setBudget(undefined);
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
      newBudget.transactions.forEach((transaction: Transaction, index: number) => {
        transaction.id = index;

        const tCatIdx = newBudget.categories.findIndex((x: BudgetCategory) => x.name === transaction.category);
        const tSubCatIdx = newBudget.categories[tCatIdx].subcategories.findIndex(
          (x: BudgetSubcategory) => x.name === transaction.subcategory
        );

        // Only count transaction towards this month's budget if it's from this month
        if (new Date(transaction.timestamp).getMonth() === new Date().getMonth()) {
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

  useEffect(() => {
    processAndSetBudget(budgetDoc.data ? (budgetDoc.data.data() as IBudget) : undefined);
  }, [budgetDoc.data]);

  if (budgetDoc.isLoading) {
    return (
      <Box mx='auto' textAlign='center' mt={20}>
        <CircularProgress size={59} isIndeterminate />
      </Box>
    );
  }

  if (!budget) {
    return <NoBudget />;
  }

  return (
    <Box>
      <Heading textAlign='center' mt={2}>
        Finance Dashboard
      </Heading>

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

      <Button leftIcon={<MdArticle />} onClick={exportBudgetDataJSON} m={4}>
        Export budget data
      </Button>
    </Box>
  );
};

export default Finances;
