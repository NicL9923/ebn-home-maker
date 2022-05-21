import { AccountBalance, AttachMoney, CreditCard, ShowChart } from '@mui/icons-material';
import { Container, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import Budget from '../components/Budget';
import Investments from '../components/Investments';
import Savings from '../components/Savings';
import Transactions from '../components/Transactions';


const Finances = (props) => {
  const { profile, db } = props;
  const [shownComponent, setShownComponent] = useState(0);
  const [budget, setBudget] = useState(null);
  

  const createAndSaveDefaultBudget = () => {
    // TODO: If profile doesn't have a budget (should only be in case of a new profile), automatically create and save one
  };

  const getBudget = async () => {
    if (!profile.budget) {
      createAndSaveDefaultBudget();
      return;
    }

    const budgetDoc = await getDoc(doc(db, 'budgets', profile.budget));

    if (budgetDoc.exists()) {
      const docData = budgetDoc.data();

      // Handle some calculations we do locally so we can reuse their values (efficiency!)
      let totalSpent = 0;
      let totalAllotted = 0;
      docData.categories.forEach(cat => {
        cat.currentSpent = cat.subcategories.reduce(((sum, { currentSpent }) => sum + currentSpent), 0);
        totalSpent += cat.currentSpent;

        cat.totalAllotted = cat.subcategories.reduce(((sum, { totalAllotted }) =>  sum + totalAllotted ), 0);
        totalAllotted += cat.totalAllotted;
      });
      docData.totalSpent = totalSpent;
      docData.totalAllotted = totalAllotted;

      docData.transactions.forEach((transaction, index) => { 
        transaction.timestamp = transaction.timestamp.toDate(); // Convert Firestore timestamp to JS date
        transaction.id = index;
      }); 


      setBudget(docData);
    } else {
      // Budget wasn't retrieved when it should've been
    }
  };

  useEffect(() => {
    if (profile) {
      getBudget();
    }
  }, [profile]);

  const showDashboardComponent = () => {
    if (!budget) return null;

    switch (shownComponent) {
      case 0:
        return <Budget budget={budget} getBudget={getBudget} profile={profile} db={db} />;
      case 1:
        return <Savings budget={budget} getBudget={getBudget} profile={profile} db={db} />;
      case 2:
        return <Investments budget={budget} getBudget={getBudget} profile={profile} db={db} />;
      case 3:
        return <Transactions budget={budget} getBudget={getBudget} profile={profile} db={db} />;
      default:
        return <Budget budget={budget} getBudget={getBudget} profile={profile} db={db} />;
    }
  };

  return (
    <Container maxWidth='lg'>
      <Drawer variant='permanent'>
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
      </Drawer>
      
      {showDashboardComponent()}
    </Container>
  );
}

export default Finances;