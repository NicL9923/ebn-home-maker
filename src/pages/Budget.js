import { EventTracker } from '@devexpress/dx-react-chart';
import { Chart, Legend, PieSeries, Tooltip as ChartTooltip } from '@devexpress/dx-react-chart-material-ui';
import { LinearProgress, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import EditableLabel from '../components/EditableLabel';

const Budget = (props) => {
  const { profile, db } = props;
  const [budget, setBudget] = useState(null);

  const getBudget = async () => {
    const budgetDoc = await getDoc(doc(db, 'budgets', profile.budget));

    if (budgetDoc.exists()) {
      setBudget(budgetDoc.data());
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
            {console.log(new Timestamp(budget.transactions[0].timestamp.seconds).toDate()) /* TODO: figuring out how to parse Firebase timestamps for transactions table */}
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
          <Chart data={budget.savingsBlobs}>
            <PieSeries name='Savings' argumentField='name' valueField='currentAmt' />
            <Legend />
            <EventTracker />
            <ChartTooltip />
          </Chart>
        }
      </Stack>

      <Typography variant='h4'>Investments</Typography>
      <Stack>
        <div>TODO: Map each investment account to a line series showing value trend, and show percent gains</div>
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