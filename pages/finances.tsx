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
  CircularProgress,
  Drawer,
  DrawerBody,
  DrawerHeader,
  Menu,
  MenuDivider,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';

enum COMPONENTS {
  BUDGET,
  SAVINGS,
  TRANSACTIONS,
}

const Finances = () => {
  const family = useUserStore((state) => state.family);

  const [shownComponent, setShownComponent] = useState(0);
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

  const showDashboardComponent = () => {
    if (!budget) return;

    const budgetComponent = <Budget budget={budget} setBudget={setBudget} />;

    switch (shownComponent) {
      case 0:
        return budgetComponent;
      case 1:
        return <Savings budget={budget} />;
      case 2:
        return <Transactions budget={budget} />;
      default:
        return budgetComponent;
    }
  };

  if (budgetDoc.isLoading) {
    return (
      <Box mx='auto' textAlign='center' mt={20}>
        <CircularProgress size={60} isIndeterminate />
      </Box>
    );
  }

  if (!budget) {
    return <NoBudget />;
  }

  return (
    <Box display='flex'>
      <Drawer
        isOpen={true}
        onClose={() => {
          return;
        }}
      >
        <DrawerHeader>Finance Dashboard</DrawerHeader>
        <DrawerBody>
          <Menu>
            <MenuList>
              <MenuItem icon={<MdAttachMoney />} onClick={() => setShownComponent(COMPONENTS.BUDGET)}>
                Budget
              </MenuItem>
              <MenuItem icon={<MdAccountBalance />} onClick={() => setShownComponent(COMPONENTS.SAVINGS)}>
                Savings
              </MenuItem>
              <MenuItem icon={<MdCreditCard />} onClick={() => setShownComponent(COMPONENTS.TRANSACTIONS)}>
                Transactions
              </MenuItem>

              <MenuDivider />

              <MenuItem icon={<MdArticle />} onClick={exportBudgetDataJSON}>
                Export budget data
              </MenuItem>
            </MenuList>
          </Menu>
        </DrawerBody>
      </Drawer>

      <Box flexGrow={1} p={1} pb={6}>
        {showDashboardComponent()}
      </Box>
    </Box>
  );
};

export default Finances;
