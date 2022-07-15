import { AccountBalance, Article, AttachMoney, CreditCard, ShowChart } from '@mui/icons-material';
import { Box, Button, CircularProgress, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Toolbar, Typography } from '@mui/material';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import Budget from '../components/Budget';
import Investments from '../components/Investments';
import Savings from '../components/Savings';
import Transactions from '../components/Transactions';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseContext } from '..';
import { UserContext } from '../App';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  const [isFetchingBudget, setIsFetchingBudget] = useState(false);

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
    setIsFetchingBudget(true);
    getDoc(doc(db, 'budgets', profile.budgetId)).then(doc => {
      setIsFetchingBudget(false);
      if (doc.exists()) {
        const docData = doc.data();

        docData.categories.forEach(cat => {
          cat.currentSpent = 0;
          cat.subcategories.forEach(subcat => subcat.currentSpent = 0);
        });

        docData.transactions.forEach((transaction, index) => { 
          transaction.timestamp = new Date(transaction.timestamp);
          transaction.id = index;

          const tCatIdx = docData.categories.findIndex(x => x.name === transaction.category);
          const tSubCatIdx = docData.categories[tCatIdx].subcategories.findIndex(x => x.name === transaction.subcategory);

          // MAJOR TODO: validate each transaction's category/subcategory when doing above 
          // - if doesn't exist anymore, null out its category & subcategory **Make sure this
          // change will be saved/reflected on its own at some point, otherwise push its update here
          // ****Note: At the same time you do this, implement when you change a (sub)category name,
          // it will update any transactions with that category automatically

          // Only count transaction towards this month's budget if it's from this month
          if (transaction.timestamp.getMonth() === (new Date().getMonth())) {
            docData.categories[tCatIdx].subcategories[tSubCatIdx].currentSpent += transaction.amt;
          }

          transaction.timestamp = transaction.timestamp.toLocaleDateString();
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

  const generateFinanceReport = () => {
    // TODO: Switch to HTML formatting and use doc.html()

    const doc = new jsPDF();
    const monthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text(`Finance Report - ${monthYear}`, 105, 15, 'center');

    doc.setFontSize(20);
    doc.text('Budget', 15, 45);
    // TODO: budget info, if any

    doc.text('Savings', 15, 65);
    const savTableColumns = ['Blob Name', 'Amount'];
    const savTableRows = [];
    budget.savingsBlobs.forEach(sb => savTableRows.push([sb.name, sb.currentAmt]));
    doc.autoTable(savTableColumns, savTableRows, { startY: 70 });

    // TODO: investments

    doc.text('Transactions', 15, 140);
    const transTableColumns = ['Amount', 'Name', 'Subcategory', 'Date'];
    const transTableRows = [];
    budget.transactions.forEach(t => {
      transTableRows.push([t.amt, t.name, t.subcategory, t.timestamp]);
    });
    doc.autoTable(transTableColumns, transTableRows, { startY: 145 });

    doc.save(`FinanceReport_${monthYear}.pdf`);
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

      <Divider />

      <List>
        <ListItem><ListItemButton onClick={generateFinanceReport}>
          <ListItemIcon><Article /></ListItemIcon>
          <ListItemText>Generate report</ListItemText>
        </ListItemButton></ListItem>
      </List>
  </>);

  return (<>
    { !budget ? (isFetchingBudget ? (<Box mx='auto' textAlign='center' mt={20}><CircularProgress size={60} /></Box>) : (<NoBudget createAndSaveDefaultBudget={createAndSaveDefaultBudget} />)) : (
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