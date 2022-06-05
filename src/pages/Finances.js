import { AccountBalance, AttachMoney, CreditCard, ShowChart } from '@mui/icons-material';
import { Box, Button, Container, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Toolbar, Typography } from '@mui/material';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import Budget from '../components/Budget';
import Investments from '../components/Investments';
import Savings from '../components/Savings';
import Transactions from '../components/Transactions';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseContext } from '..';
import { UserContext } from '../App';

// TODO: anytime we change/remove a category, update any transactions set to those

const NoBudget = (props) => {
  const { createAndSaveDefaultBudget } = props;

  return (
    <Box maxWidth='sm' textAlign='center' mt={4} mx='auto'>
      <Paper sx={{ p: 2 }}>
        <Typography variant='h6'>You don't have a budget yet!</Typography>
        <Typography variant='subtitle1' mb={4}>Create one?</Typography>

        <Button variant='contained' onClick={createAndSaveDefaultBudget}>Create Budget</Button>
      </Paper>
    </Box>
  );
};

const Finances = () => {
  const { db } = useContext(FirebaseContext);
  const { userId, profile, getProfile } = useContext(UserContext);
  const [shownComponent, setShownComponent] = useState(0);
  const [budget, setBudget] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const createAndSaveDefaultBudget = () => {
    const newBudgetUuid = uuidv4();
    const newBudgetTemplate = {
      id: newBudgetUuid,
      editors: [userId],
      monthlyNetIncome: 3000, 
      categories: [
        {
          name: 'Essentials',
          subcategories: [
            {
              name: 'Rent',
              totalAllotted: 1250
            },
            {
              name: 'Utilities',
              totalAllotted: 300
            }
          ]
        },
        {
          name: 'Lifestyle',
          subcategories: [
            {
              name: 'Spending',
              totalAllotted: 300
            }
          ]
        }
      ],
      savingsBlobs: [{ name: 'Default Blob', currentAmt: 1000 }],
      investmentAccts: [{ name: 'Default Account', broker: 'Broker', curValue: 1000, prevValues: [{ monthYear: '01/01/2020', value: 500 }] }],
      transactions: [{ id: 0, name: 'Default transaction', amt: 10, category: 'Essentials', subcategory: 'Rent', timestamp: Date.now() }]
    };

    setDoc(doc(db, 'profiles', userId), { budgetId: newBudgetUuid }, { merge: true }).then(() => {
        setDoc(doc(db, 'budgets', newBudgetUuid), newBudgetTemplate).then(() => {
          getProfile();
        });
      }
    );
  };

  const getBudget = () => {
    getDoc(doc(db, 'budgets', profile.budgetId)).then(doc => {
      if (doc.exists()) {
        const docData = doc.data();

        docData.categories.forEach(cat => {
          cat.currentSpent = 0;
          cat.subcategories.forEach(subcat => subcat.currentSpent = 0);
        });

        docData.transactions.forEach((transaction, index) => { 
          transaction.timestamp = new Date(transaction.timestamp).toLocaleDateString();
          transaction.id = index;

          const tCatIdx = docData.categories.findIndex(x => x.name === transaction.category);
          const tSubCatIdx = docData.categories[tCatIdx].subcategories.findIndex(x => x.name === transaction.subcategory);
          docData.categories[tCatIdx].subcategories[tSubCatIdx].currentSpent += transaction.amt;
        });

        // Handle some calculations we do locally so we can reuse their values (efficiency!)
        let totalSpent = 0;
        let totalAllotted = 0;
        docData.categories.forEach(cat => {
          cat.totalAllotted = cat.subcategories.reduce(((sum, subcat) =>  sum + subcat.totalAllotted ), 0);
          totalAllotted += cat.totalAllotted;

          cat.currentSpent = cat.subcategories.reduce(((sum, subcat) =>  sum + subcat.currentSpent ), 0);
          totalSpent += cat.currentSpent;
        });
        docData.totalSpent = totalSpent;
        docData.totalAllotted = totalAllotted;


        setBudget(docData);
      } else {
        // Budget wasn't retrieved when it should've been
      }
    });
  };

  useEffect(() => {
    if (profile && profile.budgetId) {
      getBudget();
    } else {
      setBudget(null);
    }
  }, [profile]);

  const showDashboardComponent = () => {
    const budgetComponent = (<Budget budget={budget} setBudget={setBudget} getBudget={getBudget} />);
    
    switch (shownComponent) {
      case 0:
        return budgetComponent;
      case 1:
        return <Savings budget={budget} getBudget={getBudget} />;
      case 2:
        return <Investments budget={budget} getBudget={getBudget} />;
      case 3:
        return <Transactions budget={budget} getBudget={getBudget} />;
      default:
        return budgetComponent;
    }
  };

  const drawerContents = (<>
    <Toolbar />
      <Typography variant='h6' mt={2} mb={1} mx='auto'>Finance Dashboard</Typography>
      <Divider />
      <List>
        <ListItem><ListItemButton onClick={() => setShownComponent(0)} selected={shownComponent === 0}>
          <ListItemIcon><AttachMoney /></ListItemIcon>
          <ListItemText>Budget</ListItemText>
        </ListItemButton></ListItem>
        <ListItem><ListItemButton onClick={() => setShownComponent(1)} selected={shownComponent === 1}>
          <ListItemIcon><AccountBalance /></ListItemIcon>
          <ListItemText>Savings</ListItemText>
        </ListItemButton></ListItem>
        <ListItem><ListItemButton onClick={() => setShownComponent(2)} selected={shownComponent === 2}>
          <ListItemIcon><ShowChart /></ListItemIcon>
          <ListItemText>Investments</ListItemText>
        </ListItemButton></ListItem>
        <ListItem><ListItemButton onClick={() => setShownComponent(3)} selected={shownComponent === 3}>
          <ListItemIcon><CreditCard /></ListItemIcon>
          <ListItemText>Transactions</ListItemText>
        </ListItemButton></ListItem>
      </List>
  </>);

  return (<>
    {!budget ? (<NoBudget createAndSaveDefaultBudget={createAndSaveDefaultBudget} />) : (
      <Box display='flex'>
        <Button variant='contained' onClick={() => setMobileDrawerOpen(true)} sx={{ display: { xs: 'block', sm: 'none' }, position: 'fixed', zIndex: 3000, bottom: 5, right: 5 }}>Dashboard Menu</Button>

        <Drawer variant='permanent' sx={{ display: { xs: 'none', sm: 'block' }, flexShrink: 0, width: 250 }}>
          {drawerContents}
        </Drawer>
        <Drawer
          variant='temporary'
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          sx={{ display: { xs: 'block', sm: 'none' } }}
          ModalProps={{ keepMounted: true }}
        >
          {drawerContents}
        </Drawer>
        
        <Box flexGrow={1}>
          {showDashboardComponent()}
        </Box>
      </Box>
    )}
  </>);
}

export default Finances;