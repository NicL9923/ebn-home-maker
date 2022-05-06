import { LinearProgress, Stack, Typography } from '@mui/material';
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
      docData.transactions.forEach(transaction => { transaction.timestamp = transaction.timestamp.toDate(); }); // Convert Firestore timestamp to JS date
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
    <div>
      <Typography variant='h3'>Budget - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Typography>
      <Stack>
        {budget &&
          <Stack key={budget.name}>
            <Typography variant='h5'>{budget.name}</Typography>

            <Typography variant='h6'>Net Income: ${budget.monthlyNetIncome}</Typography>
            <Typography variant='h6'>Currently Allotted: ${`TODO - add up all categories totalAllotted in a fn`}</Typography>
            <Typography variant='h6'>Currently Spent: ${`TODO - add up all categories currentSpent in a fn`}</Typography>

            {budget.categories.map(category => 
              <Stack key={category.name}>
                <EditableLabel initialValue={category.name} />
                <Typography variant='body1'>${category.currentSpent} Spent / ${category.totalAllotted} Allotted</Typography>
                <LinearProgress value={category.currentSpent / category.totalAllotted} variant='determinate' />
                  {category.subcategories.map(subcategory =>
                    <Stack key={subcategory.name}>
                      <EditableLabel initialValue={subcategory.name} />
                      <Typography variant='body1'>${subcategory.currentSpent} Spent / ${subcategory.totalAllotted} Allotted</Typography>
                      <LinearProgress value={subcategory.currentSpent / subcategory.totalAllotted} variant='determinate' />
                    </Stack>
                  )}
              </Stack>
            )}
          </Stack>
        }
        
      </Stack>
        

      <Typography variant='h4'>Savings</Typography>
      <Stack>
        {budget &&
          <PieChart width={400} height={350}>
            <Pie 
              activeIndex={savingsChartIndex}
              activeShape={renderActiveShape}
              data={budget.savingsBlobs} 
              nameKey='name'
              dataKey='currentAmt'
              innerRadius={60}
              onMouseEnter={(_, index) => setSavingsChartIndex(index)}
            />
          </PieChart>
        }
      </Stack>

      <Typography variant='h4'>Investment Accounts</Typography>
      <Stack>
        {budget && budget.investmentAccts.map(acct =>
          <Stack>
            <Typography variant='h5'>{acct.name}</Typography>
            <Typography variant='h6'>{acct.broker}</Typography>
            <Typography variant='body1'>${acct.curValue}</Typography>

            <LineChart width={400} height={350} data={[...acct.prevValues, { monthYear: Date.now().toLocaleString(), value: acct.curValue }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthYear" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#82ca9d" activeDot={{ r: 8 }} />
            </LineChart>
          </Stack>
        )}
      </Stack>

      <Typography variant='h4'>Transactions</Typography>
      <Stack height={300}>
        {budget &&
          <DataGrid
            columns={[{ field: 'amt', headerName: 'Amount' }, { field: 'name', headerName: 'Name' }, { field: 'category', headerName: 'Category' }, { field: 'timestamp', headerName: 'Date', width: 200 }]}
            rows={budget.transactions}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20, 50, 100]}
            getRowId={row => row.timestamp}
          />
        }
      </Stack>
    </div>
  );
}

export default Budget;