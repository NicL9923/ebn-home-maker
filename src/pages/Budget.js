import { CircularProgress, Stack, Typography } from '@mui/material';
import React from 'react';
import EditableLabel from '../components/EditableLabel';

// NOTE: Only first budget a user is apart of is mapped currently

const Budget = () => {
  return (
    <div>
      <Typography variant='h3'>Budget</Typography>
      <Stack>
        <Typography variant='h4'>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Typography>

        <div>Map categories to stacks with EditableLabels as headers</div>

        <EditableLabel initialValue='asd' />
      </Stack>
        

      <Typography variant='h4'>Savings</Typography>
      <Stack>
        <div>Map each savings blob to a Progress as below</div>

        <CircularProgress variant='determinate' value={60} />
      </Stack>

      <Typography variant='h4'>Investments</Typography>
      <Stack>
        <div>Map each investment account to a line series showing value trend, and show percent gains</div>
      </Stack>

      <Typography variant='h4'>Transactions</Typography>
      <Stack>
        <div>Show 10 most recent transactions followed by Show More button (?)</div>
      </Stack>
    </div>
  );
}

export default Budget;