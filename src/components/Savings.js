import { Add, Clear } from '@mui/icons-material';
import { Box, Button, Grid, IconButton, Paper, Stack, Typography } from '@mui/material';
import { doc, setDoc } from 'firebase/firestore';
import React, { useContext } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { FirebaseContext } from '..';
import { UserContext } from '../App';
import EditableLabel from './EditableLabel';

// TODO: handle duplicate name stuff here too

const renderCustomizedLabel = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, payload, value, percent } = props;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (<>
    <text x={x} y={y} fill='white' textAnchor='middle' dominantBaseline='central'>
      {`${payload.name} (${(percent * 100).toFixed(0)}%)`}
    </text>
    <text x={x} y={y + 20} fill='white' textAnchor='middle' dominantBaseline='central'>
      ${parseFloat(value).toFixed(2)}
    </text>
  </>);
};

const Savings = (props) => {
    const { db } = useContext(FirebaseContext);
    const { profile } = useContext(UserContext);
    const { budget, getBudget } = props;
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const saveUpdBlobsArr = (newArr) => {
      setDoc(doc(db, 'budgets', profile.budgetId), { savingsBlobs: newArr }, { merge: true }).then(() => getBudget());
    };

    const createSavingsBlob = () => {
      const updBlobsArr = [...budget.savingsBlobs];
      updBlobsArr.push({ name: 'New Blob', currentAmt: 0 });

      saveUpdBlobsArr(updBlobsArr);
    };
    
    const updateSavingsBlobName = (oldName, newName) => {
      const updBlobsArr = [...budget.savingsBlobs];
      updBlobsArr[updBlobsArr.findIndex(blob => blob.name === oldName)].name = newName;

      saveUpdBlobsArr(updBlobsArr);
    };

    const updateSavingsBlobAmt = (blobName, newAmt) => {
      const updBlobsArr = [...budget.savingsBlobs];
      updBlobsArr[updBlobsArr.findIndex(blob => blob.name === blobName)].currentAmt = parseFloat(newAmt);

      saveUpdBlobsArr(updBlobsArr);
    };

    const deleteSavingsBlob = (blobName) => {
      const updBlobsArr = [...budget.savingsBlobs];
      updBlobsArr.splice(updBlobsArr.findIndex(blob => blob.name === blobName), 1);

      saveUpdBlobsArr(updBlobsArr);
    };

    return (
      <Box mt={2}>
        <Typography variant='h3' mb={2}>Savings Blobs</Typography>

        <Grid container mb={4} spacing={2}>
          {budget.savingsBlobs.map(blob =>
            <Grid container item xs={6} md={3} key={blob.name}>
              <Paper sx={{ p: 2 }}>
                <Stack direction='row' alignItems='center' justifyContent='space-between'>
                  <EditableLabel initialValue={blob.name} variant='h4' onBlur={(newValue) => updateSavingsBlobName(blob.name, newValue)} />
                  <IconButton sx={{ ml: 4 }} onClick={() => deleteSavingsBlob(blob.name)}><Clear /></IconButton>
                </Stack>
                <EditableLabel variant='h5' initialValue={parseFloat(blob.currentAmt).toFixed(2)} prefix='$' onBlur={(newValue) => updateSavingsBlobAmt(blob.name, newValue)} />
              </Paper>
            </Grid>
          )}
        </Grid>

        <Box maxWidth='md'>
          <Paper sx={{ p: 2, mb: 4 }}>
            <Typography variant='h4'>Total Saved: ${parseFloat(budget.savingsBlobs.reduce(((sum, { currentAmt }) =>  sum + currentAmt ), 0)).toFixed(2)}</Typography>
            <ResponsiveContainer width='100%' height={400}>
              <PieChart>
                <Pie
                  label={renderCustomizedLabel}
                  labelLine={false}
                  data={budget.savingsBlobs} 
                  nameKey='name'
                  dataKey='currentAmt'
                >
                  {budget.savingsBlobs.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Box>

        <Button variant='contained' startIcon={<Add />} onClick={createSavingsBlob}>Create New Blob</Button>
      </Box>
    );
};

export default Savings;