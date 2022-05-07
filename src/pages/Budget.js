import { Add, Clear } from '@mui/icons-material';
import { Button, IconButton, LinearProgress, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, Pie, PieChart, Sector, Tooltip, XAxis, YAxis } from 'recharts';
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


const Budget = (props) => {
  const { profile, db } = props;
  const [budget, setBudget] = useState(null);
  const [savingsChartIndex, setSavingsChartIndex] = useState(0);

  const getBudget = async () => {
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
      // Budget wasn't retrieved
    }
  };

  useEffect(() => {
    if (profile) {
      getBudget();
    }
  }, [profile]);

  return (
    <Stack maxWidth='lg' mx='auto'>
      <Typography variant='h3'>Budget - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Typography>
      <Stack>
        {budget &&
          <Stack key={budget.name} width='50%'>
            <Typography variant='h5'>{budget.name}</Typography>

            <Typography variant='h6'>Net Income: ${budget.monthlyNetIncome}</Typography>
            <Typography variant='h6'>Currently Allotted: ${budget.totalAllotted}</Typography>
            <Typography variant='h6'>Currently Spent: ${budget.totalSpent}</Typography>

            {budget.categories.map(category => 
              <Stack key={category.name}>
                <Stack direction='row'>
                  <EditableLabel initialValue={category.name} />
                  <>
                    <IconButton><Add /></IconButton>
                    <IconButton><Clear /></IconButton>
                  </>
                </Stack>
                <Typography variant='body1'>${category.currentSpent} Spent / ${category.totalAllotted} Allotted</Typography>
                <LinearProgress value={(category.currentSpent / category.totalAllotted) * 100} variant='determinate' />
                  {category.subcategories.map(subcategory =>
                    <Stack key={subcategory.name} ml={6}>
                      <EditableLabel initialValue={subcategory.name} />
                      <Typography variant='body1'>${subcategory.currentSpent} Spent / ${subcategory.totalAllotted} Allotted</Typography>
                      <LinearProgress value={(subcategory.currentSpent / subcategory.totalAllotted) * 100} variant='determinate' />
                    </Stack>
                  )}
              </Stack>
            )}
          </Stack>
        }
        
      </Stack>
        

      <Typography variant='h4'>Savings</Typography>
      <Stack height={400}>
        {budget &&
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
        }
      </Stack>

      <Typography variant='h4'>Investment Accounts</Typography>
      <Stack>
        {budget && budget.investmentAccts.map(acct =>
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
          </Stack>
        )}
      </Stack>

      <Typography variant='h4'>Transactions</Typography>
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
    </Stack>
  );
}

export default Budget;