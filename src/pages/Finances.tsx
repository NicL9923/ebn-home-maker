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
import Budget from '../components/Budget';
import Savings from '../components/Savings';
import Transactions from '../components/Transactions';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseContext } from '../Firebase';
import { UserContext } from '../App';
// import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BudgetCategory, BudgetIF, BudgetSubcategory, Transaction } from 'models/types';

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
  const { userId, profile, getProfile } = useContext(UserContext);
  const [shownComponent, setShownComponent] = useState(0);
  const [budget, setBudget] = useState<BudgetIF | undefined>(undefined);
  const [isFetchingBudget, setIsFetchingBudget] = useState(false);

  const createAndSaveDefaultBudget = () => {
    if (!userId) return;

    const newBudgetUuid = uuidv4();
    const newBudgetTemplate: BudgetIF = {
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

    firebase.updateProfile(userId, { budgetId: newBudgetUuid }).then(() => {
      firebase.createBudget(newBudgetUuid, newBudgetTemplate).then(() => {
        getProfile();
      });
    });
  };

  const getBudget = () => {
    if (!profile?.budgetId) return;

    setIsFetchingBudget(true);
    firebase.getBudget(profile.budgetId).then((doc) => {
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

        setBudget(docData as BudgetIF);
      } else {
        // Budget wasn't retrieved when it should've been
      }
    });
  };

  const generateFinanceReport = () => {
    alert("Finance reports are currently disabled - they'll be rebuilt soon!");

    /*const doc = new jsPDF();
    const monthYear = new Date().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text(`Finance Report - ${monthYear}`, 105, 15, 'center');

    doc.setFontSize(20);
    doc.text('Budget', 15, 45);
    // TODO: budget info, if any

    doc.text('Savings', 15, 65);
    const savTableColumns = ['Blob Name', 'Amount'];
    const savTableRows = [];
    budget.savingsBlobs.forEach((sb) =>
      savTableRows.push([sb.name, sb.currentAmt])
    );
    doc.autoTable(savTableColumns, savTableRows, { startY: 70 });

    doc.text('Transactions', 15, 140);
    const transTableColumns = ['Amount', 'Name', 'Subcategory', 'Date'];
    const transTableRows = [];
    budget.transactions.forEach((t) => {
      transTableRows.push([t.amt, t.name, t.subcategory, t.timestamp]);
    });
    doc.autoTable(transTableColumns, transTableRows, { startY: 145 });

    doc.save(`FinanceReport_${monthYear}.pdf`);*/
  };

  useEffect(() => {
    if (profile && profile.budgetId) {
      getBudget();
    } else {
      setBudget(undefined);
    }
  }, [profile]);

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
          <ListItemButton onClick={generateFinanceReport}>
            <ListItemIcon>
              <Article />
            </ListItemIcon>
            <ListItemText>Generate report</ListItemText>
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

          <Box flexGrow={1} pb={6}>
            {showDashboardComponent()}
          </Box>
        </Box>
      )}
    </>
  );
};

export default Finances;
