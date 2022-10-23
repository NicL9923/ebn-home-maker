import { AccountBalance, Article, AttachMoney, CreditCard } from '@mui/icons-material';
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import Budget from '../src/components/Finances/Budget';
import Savings from '../src/components/Finances/Savings';
import Transactions from '../src/components/Finances/Transactions';
import { v4 as uuidv4 } from 'uuid';
import { UserContext } from 'providers/AppProvider';
import { FirebaseContext } from 'providers/FirebaseProvider';
import 'jspdf-autotable';
import { BudgetCategory, IBudget, BudgetSubcategory, Transaction } from 'models/types';

enum COMPONENTS {
  BUDGET,
  SAVINGS,
  TRANSACTIONS,
}

interface NoBudgetProps {
  createAndSaveDefaultBudget: () => void;
}

const NoBudget = (props: NoBudgetProps): JSX.Element => {
  const { createAndSaveDefaultBudget } = props;

  return (
    <Box maxWidth='sm' textAlign='center' mt={4} mx='auto'>
      <Paper sx={{ p: 2 }}>
        <Typography variant='h6'>You don&apos;t have a budget yet!</Typography>
        <Typography variant='subtitle1' mb={4}>
          Create one?
        </Typography>

        <Button variant='contained' onClick={createAndSaveDefaultBudget}>
          Create Budget
        </Button>
      </Paper>
    </Box>
  );
};

const Finances = (): JSX.Element => {
  const firebase = useContext(FirebaseContext);
  const { userId, profile, family, getFamily } = useContext(UserContext);
  const [shownComponent, setShownComponent] = useState(0);
  const [budget, setBudget] = useState<IBudget | undefined>(undefined);
  const [isFetchingBudget, setIsFetchingBudget] = useState(false);

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

    firebase.updateFamily(profile.familyId, { budgetId: newBudgetUuid }).then(() => {
      firebase.createBudget(newBudgetUuid, newBudgetTemplate).then(() => {
        getFamily();
      });
    });
  };

  const getBudget = () => {
    if (!family?.budgetId) return;

    setIsFetchingBudget(true);
    firebase.getBudget(family.budgetId).then((doc) => {
      setIsFetchingBudget(false);
      if (doc.exists()) {
        const docData = doc.data();

        if (!docData.categories) {
          console.error('Missing budget categories array!');
          docData.categories = [];
        } else {
          docData.categories.forEach((cat: BudgetCategory) => {
            cat.currentSpent = 0;
            cat.subcategories.forEach((subcat: BudgetSubcategory) => (subcat.currentSpent = 0));
          });
        }

        if (!docData.transactions) {
          console.error('Missing budget categories array!');
          docData.transactions = [];
        } else {
          docData.transactions.forEach((transaction: Transaction, index: number) => {
            transaction.id = index;

            const tCatIdx = docData.categories.findIndex((x: BudgetCategory) => x.name === transaction.category);
            const tSubCatIdx = docData.categories[tCatIdx].subcategories.findIndex(
              (x: BudgetSubcategory) => x.name === transaction.subcategory
            );

            // Only count transaction towards this month's budget if it's from this month
            if (new Date(transaction.timestamp).getMonth() === new Date().getMonth()) {
              // Verify cat and subcat were found (i.e. if the transaction has valid ones)
              if (tCatIdx !== -1 && tSubCatIdx !== -1) {
                docData.categories[tCatIdx].subcategories[tSubCatIdx].currentSpent += transaction.amt;
              }
            }
          });
        }

        // Handle some calculations we do locally so we can reuse their values (efficiency!)
        let totalSpent = 0;
        let totalAllotted = 0;
        docData.categories.forEach((cat: BudgetCategory) => {
          cat.totalAllotted = cat.subcategories.reduce((sum, subcat) => sum + subcat.totalAllotted, 0);
          totalAllotted += cat.totalAllotted;

          cat.currentSpent = cat.subcategories.reduce((sum, subcat) => sum + subcat.currentSpent, 0);
          totalSpent += cat.currentSpent;
        });
        docData.totalSpent = totalSpent;
        docData.totalAllotted = totalAllotted;

        setBudget(docData as IBudget);
      } else {
        // Budget wasn't retrieved when it should've been
      }
    });
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
    if (family && family.budgetId) {
      getBudget();
    } else {
      setBudget(undefined);
    }
  }, [family]);

  const showDashboardComponent = () => {
    if (!budget) return;

    const budgetComponent = <Budget budget={budget} setBudget={setBudget} getBudget={getBudget} />;

    switch (shownComponent) {
      case 0:
        return budgetComponent;
      case 1:
        return <Savings budget={budget} getBudget={getBudget} />;
      case 2:
        return <Transactions budget={budget} getBudget={getBudget} />;
      default:
        return budgetComponent;
    }
  };

  const drawerContents = (
    <>
      <Toolbar />
      <Typography variant='h6' mt={2} mb={1} mx='auto'>
        Finance Dashboard
      </Typography>
      <Divider />
      <List>
        <ListItem>
          <ListItemButton onClick={() => setShownComponent(COMPONENTS.BUDGET)} selected={shownComponent === 0}>
            <ListItemIcon>
              <AttachMoney />
            </ListItemIcon>
            <ListItemText>Budget</ListItemText>
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton onClick={() => setShownComponent(COMPONENTS.SAVINGS)} selected={shownComponent === 1}>
            <ListItemIcon>
              <AccountBalance />
            </ListItemIcon>
            <ListItemText>Savings</ListItemText>
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton onClick={() => setShownComponent(COMPONENTS.TRANSACTIONS)} selected={shownComponent === 3}>
            <ListItemIcon>
              <CreditCard />
            </ListItemIcon>
            <ListItemText>Transactions</ListItemText>
          </ListItemButton>
        </ListItem>
      </List>

      <Divider />

      <List>
        <ListItem>
          <ListItemButton onClick={exportBudgetDataJSON}>
            <ListItemIcon>
              <Article />
            </ListItemIcon>
            <ListItemText>Export budget data</ListItemText>
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <>
      {!budget ? (
        isFetchingBudget ? (
          <Box mx='auto' textAlign='center' mt={20}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <NoBudget createAndSaveDefaultBudget={createAndSaveDefaultBudget} />
        )
      ) : (
        <Box display='flex'>
          <Paper
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 100,
              pb: 2,
            }}
            elevation={5}
          >
            <BottomNavigation
              showLabels
              value={shownComponent}
              onChange={(event, newValue) => setShownComponent(newValue)}
              sx={{ display: { xs: 'normal', sm: 'none' } }}
            >
              <BottomNavigationAction label='Budget' icon={<AttachMoney />} />
              <BottomNavigationAction label='Savings' icon={<AccountBalance />} />
              <BottomNavigationAction label='Transactions' icon={<CreditCard />} />
            </BottomNavigation>
          </Paper>

          <Drawer
            variant='permanent'
            sx={{
              display: { xs: 'none', sm: 'block' },
              flexShrink: 0,
              width: 250,
            }}
          >
            {drawerContents}
          </Drawer>

          <Box flexGrow={1} p={1} pb={6}>
            {showDashboardComponent()}
          </Box>
        </Box>
      )}
    </>
  );
};

export default Finances;
