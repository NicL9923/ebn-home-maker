import { AccountBalance, Add, AttachMoney, Clear, CreditCard, Edit, ShowChart, SubdirectoryArrowRight } from '@mui/icons-material';
import { Box, Button, Container, Divider, Drawer, Grid, IconButton, LinearProgress, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Stack, Toolbar, Tooltip, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, Pie, PieChart, Sector, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts';
import EditableLabel from '../components/EditableLabel';

// TODO: handle duplicate category names

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

  const setMonthlyNetIncome = (newValue) => {
    setDoc(doc(db, 'budgets', profile.budget), { monthlyNetIncome: parseFloat(newValue) }, { merge: true }).then(() => getBudget());
  };

  const setCategoryName = (newValue, oldName) => {
    if (newValue === oldName) return;
    
    const updArr = [...budget.categories];

    // TODO: Do this a better way (using proper JS array methods probably)
    updArr.forEach(cat => {
      if (cat.name === oldName) {
        cat.name = newValue;
      }
    });

    setDoc(doc(db, 'budgets', profile.budget), { categories: updArr }, { merge: true }).then(() => getBudget());
  };

  const setSubCatProperty = (newValue, oldName, catName, propName) => {
    if (newValue === oldName) return;
    
    const updArr = [...budget.categories];

    updArr.forEach(cat => {
      if (cat.name === catName) {
        cat.subcategories.forEach(subCat => {
          if (subCat.name === oldName) {
            if (propName === 'name') {
              subCat.name = newValue;
            }
            else if (propName === 'allotted') {
              subCat.totalAllotted = parseFloat(newValue);
            } else {
              console.error('Invalid property to set for subcat');
            }
          }
        });
      }
    });
    
    setDoc(doc(db, 'budgets', profile.budget), { categories: updArr }, { merge: true }).then(() => getBudget());
  };

  const addNewCategory = () => {
    setDoc(doc(db, 'budgets', profile.budget), { categories: [...budget.categories, { name: 'New Category', subcategories: [] }] }, { merge: true }).then(() => getBudget());
  };

  const removeCategory = (catName) => {
    const updArr = [...budget.categories];

    updArr.splice(updArr.findIndex((cat) => cat.name === catName), 1);

    setDoc(doc(db, 'budgets', profile.budget), { categories: updArr }, { merge: true }).then(() => getBudget()); 
  };

  const addNewSubCategory = (catName) => {
    const updArr = [...budget.categories];

    updArr.forEach(cat => {
      if (cat.name === catName) {
        cat.subcategories.push({ name: 'New SubCategory', currentSpent: 0, totalAllotted: 0 });
      }
    });

    setDoc(doc(db, 'budgets', profile.budget), { categories: updArr }, { merge: true }).then(() => getBudget());
  };

  const removeSubCategory = (catName, subCatName) => {
    const updArr = [...budget.categories];

    updArr.forEach(cat => {
      if (cat.name === catName) {
        cat.subcategories.splice(cat.subcategories.findIndex((subcat) => subcat.name === subCatName), 1);
      }
    });

    setDoc(doc(db, 'budgets', profile.budget), { categories: updArr }, { merge: true }).then(() => getBudget());
  };

  useEffect(() => {
    if (profile) {
      getBudget();
    }
  }, [profile]);

  const showBudget = () => {
    if (budget) {
      return (<>
        <Typography variant='h3' mb={4} mt={2}>Budget - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Typography>
        <Stack key={budget.id}>
          <Grid container mb={4}>
            <Grid item xs={4}>
              <Paper component={Container} sx={{ height: 150, width: 250 }}>
                <Typography variant='h6'>Net Income</Typography>
                <EditableLabel variant='h4' prefix='$' initialValue={budget.monthlyNetIncome.toFixed(2)} onBlur={setMonthlyNetIncome} />
              </Paper>
            </Grid>

            <Grid item xs={4}>
              <Paper component={Container} sx={{ height: 150, width: 250 }}>
                <Typography variant='h6'>Total Allotted</Typography>
                <Typography variant='h4'>${budget.totalAllotted.toFixed(2)}</Typography>
                <Typography variant='h6'>${Math.abs(budget.monthlyNetIncome - budget.totalAllotted).toFixed(2)} {(budget.monthlyNetIncome - budget.totalAllotted) >= 0 ? 'to allot' : 'over-allotted'}</Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={4}>
              <Paper component={Container} sx={{ height: 150, width: 250 }}>
                <Typography variant='h6'>Total Spent</Typography>
                <Typography variant='h4'>${budget.totalSpent.toFixed(2)}</Typography>
                <Typography variant='h6'>${Math.abs(budget.totalAllotted - budget.totalSpent).toFixed(2)} {(budget.totalAllotted - budget.totalSpent) >= 0 ? 'remaining' : 'over-budget'}</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper>
            <Grid container alignItems='center'>
              <Grid item xs={8}>
                <Stack direction='row' alignItems='center'>
                  <Tooltip title='Add category'><IconButton onClick={addNewCategory}><Add /></IconButton></Tooltip>
                
                  <Stack>
                    <Typography variant='body1'>Category</Typography>
                    <Stack direction='row' alignItems='end'>
                      <SubdirectoryArrowRight />
                      <Typography variant='body2'>Sub-category</Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={2}><Typography variant='body1'>Allotted</Typography></Grid>
              <Grid item xs={2}><Typography variant='body1'>Spent</Typography></Grid>
            </Grid>

            <Divider />

            <Box p={2}>
              {budget.categories.map(category => 
                <Stack key={category.name} mb={1}>
                  <Grid container alignItems='center'>
                    <Grid item xs={8}>
                      <Stack direction='row' alignItems='center'>
                        <EditableLabel variant='h5' initialValue={category.name} onBlur={(newValue) => setCategoryName(newValue, category.name)} />
                        <Tooltip title='Add sub-category'><IconButton onClick={() => addNewSubCategory(category.name)}><Add /></IconButton></Tooltip>
                        <Tooltip title='Delete category'><IconButton onClick={() => removeCategory(category.name)}><Clear /></IconButton></Tooltip>
                      </Stack>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant='body1'>${category.totalAllotted.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant='body1'>${category.currentSpent.toFixed(2)}</Typography>
                    </Grid>
                  </Grid>

                  {category.subcategories.map(subcategory =>
                    <Stack key={subcategory.name} ml={6}>
                      <Grid container alignItems='center'>
                        <Grid item xs={8}>
                          <Stack direction='row' alignItems='center'>
                            <EditableLabel initialValue={subcategory.name} onBlur={(newValue) => setSubCatProperty(newValue, subcategory.name, category.name, 'name')} />
                            <Tooltip title='Delete sub-category'><IconButton onClick={() => removeSubCategory(category.name, subcategory.name)}><Clear /></IconButton></Tooltip>
                          </Stack>
                          <LinearProgress value={(subcategory.currentSpent / subcategory.totalAllotted) * 100} variant='determinate' sx={{ width: '85%' }} />
                        </Grid>

                        <Grid item xs={2}>
                          <EditableLabel variant='body1' prefix='$' initialValue={`${subcategory.totalAllotted.toFixed(2)}`} onBlur={(newValue) => setSubCatProperty(newValue, subcategory.name, category.name, 'allotted')} />
                        </Grid>
                        <Grid item xs={2}>
                          <Typography variant='body1'>${subcategory.currentSpent.toFixed(2)}</Typography>
                        </Grid>
                      </Grid>
                    </Stack>
                  )}
                </Stack>
              )}
            </Box>
          </Paper>
        </Stack>
      </>);
    } else {
      // TODO: handle no budget
    }
  };

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
                  <ChartTooltip formatter={(value) => `$${value}`} />
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
      
      {showComponent()}
    </Container>
  );
}

export default Finances;