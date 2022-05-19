import { AccountBalance, Add, AttachMoney, Clear, CreditCard, Edit, ShowChart } from '@mui/icons-material';
import { Button, Drawer, IconButton, LinearProgress, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Stack, Toolbar, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, Pie, PieChart, Sector, Tooltip, XAxis, YAxis } from 'recharts';
import EditableLabel from '../components/EditableLabel';

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        Savings Blobs
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{payload.name}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`$${value} (${Math.trunc(percent * 100)}%)`}
      </text>
    </g>
  );
};


const Finances = (props) => {
  const { profile, db } = props;
  const [shownComponent, setShownComponent] = useState(0);
  const [budget, setBudget] = useState(null);
  const [savingsChartIndex, setSavingsChartIndex] = useState(0);

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

  const showBudget = () => (<Paper>
    <Typography variant='h3'>Budget - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Typography>
      <Stack>
        {budget &&
          <Stack key={budget.id} width='50%'>
            <Stack direction='row'>
              <Typography variant='h6'>Net Income: ${budget.monthlyNetIncome}</Typography>
              <IconButton><Edit /></IconButton>
            </Stack>
            <Typography variant='h6'>Currently Allotted: ${budget.totalAllotted} (${Math.abs(budget.monthlyNetIncome - budget.totalAllotted)} {(budget.monthlyNetIncome - budget.totalAllotted) >= 0 ? 'remaining' : 'over-allotted'})</Typography>
            <Typography variant='h6'>Currently Spent: ${budget.totalSpent}</Typography>

            {budget.categories.map(category => 
              <Stack key={category.name}>
                <Stack direction='row'>
                  <EditableLabel initialValue={category.name} />
                  <IconButton><Add /></IconButton>
                  <IconButton><Clear /></IconButton>
                </Stack>
                <Typography variant='body1'>${category.currentSpent} Spent / ${category.totalAllotted} Allotted</Typography>
                <LinearProgress value={(category.currentSpent / category.totalAllotted) * 100} variant='determinate' />
                  {category.subcategories.map(subcategory =>
                    <Stack key={subcategory.name} ml={6}>
                      <Stack direction='row'>
                        <EditableLabel initialValue={subcategory.name} />
                        <IconButton><Edit /></IconButton>
                        <IconButton><Clear /></IconButton>
                      </Stack>
                      <Typography variant='body1'>${subcategory.currentSpent} Spent / ${subcategory.totalAllotted} Allotted</Typography>
                      <LinearProgress value={(subcategory.currentSpent / subcategory.totalAllotted) * 100} variant='determinate' />
                    </Stack>
                  )}
              </Stack>
            )}

            <Button variant='contained'>Add category</Button>
          </Stack>
        }
        
      </Stack>
  </Paper>);

  const showSavings = () => (<Paper>
    <Typography variant='h4' mt={8}>Savings Blobs</Typography>
      <Stack>
        {budget &&
        <>
          {budget.savingsBlobs.map(blob => 
            <Stack key={blob.name} direction='row'>
              <Typography variant='h5'>{blob.name} </Typography>
              <Typography variant='h6' ml={1}>- ${blob.currentAmt}</Typography>
              <Stack direction='row'>
                <IconButton><Edit /></IconButton>
                <IconButton><Clear /></IconButton>
              </Stack>
            </Stack>
          )}

          <PieChart width={350} height={400}>
              <Pie 
                activeIndex={savingsChartIndex}
                activeShape={renderActiveShape}
                data={budget.savingsBlobs} 
                nameKey='name'
                dataKey='currentAmt'
                innerRadius={80}
                onMouseEnter={(_, index) => setSavingsChartIndex(index)}
              />
            </PieChart>

            <Button variant='contained'>Add savings blob</Button>
        </>
        }
      </Stack>
  </Paper>);

  const showInvestments = () => (<Paper>
    <Typography variant='h4' mt={8}>Investment Accounts</Typography>
      <Stack>
        {budget &&
          <>
            {budget.investmentAccts.map(acct =>
              <Stack key={acct.name}>
                <Typography variant='h5'>{acct.name}</Typography>
                <Typography variant='h6'>{acct.broker}</Typography>
                <Typography variant='body1'>Current Valuation: ${acct.curValue}</Typography>

                <LineChart width={400} height={350} data={[...acct.prevValues, { monthYear: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), value: acct.curValue }]}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='monthYear' />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Line type='monotone' dataKey='value' stroke='#82ca9d' activeDot={{ r: 6 }} name='Value' />
                </LineChart>

                <Stack direction='row'>
                  <Button variant='contained'>Modify value points</Button>
                  <Button variant='outlined'>Delete account</Button>
                </Stack>
              </Stack>
            )}

            <Button variant='contained'>Add investment account</Button>
          </>
        }
      </Stack>
  </Paper>);

  const showTransactions = () => (<Paper>
    <Typography variant='h4' mt={8}>Transactions</Typography>
      {budget &&
        <Stack height={300}>
          <DataGrid
            columns={[{ field: 'amt', headerName: 'Amount' }, { field: 'name', headerName: 'Name' }, { field: 'category', headerName: 'Category' }, { field: 'timestamp', headerName: 'Date', width: 200 }]}
            rows={budget.transactions}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20, 50, 100]}
          />
          <Button startIcon={<Add />} variant='contained'>Add transaction</Button>
        </Stack>
      }
  </Paper>);

  const showComponent = () => {
    switch (shownComponent) {
      case 0:
        return showBudget();
      case 1:
        return showSavings();
      case 2:
        return showInvestments();
      case 3:
        return showTransactions();
      default:
        return showBudget();
    }
  };

  return (
    <Stack maxWidth='lg' mx='auto'>
      <Drawer variant='permanent'>
        <Toolbar />
        <List>
          <ListItem><ListItemButton onClick={() => setShownComponent(0)}>
            <ListItemIcon><AttachMoney /></ListItemIcon>
            <ListItemText>Budget</ListItemText>
          </ListItemButton></ListItem>
          <ListItem><ListItemButton onClick={() => setShownComponent(1)}>
            <ListItemIcon><AccountBalance /></ListItemIcon>
            <ListItemText>Savings</ListItemText>
          </ListItemButton></ListItem>
          <ListItem><ListItemButton onClick={() => setShownComponent(2)}>
            <ListItemIcon><ShowChart /></ListItemIcon>
            <ListItemText>Investments</ListItemText>
          </ListItemButton></ListItem>
          <ListItem><ListItemButton onClick={() => setShownComponent(3)}>
            <ListItemIcon><CreditCard /></ListItemIcon>
            <ListItemText>Transactions</ListItemText>
          </ListItemButton></ListItem>
        </List>
      </Drawer>
      
      {showComponent()}
    </Stack>
  );
}

export default Finances;