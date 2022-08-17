import { Add, Clear } from '@mui/icons-material';
import { Box, Button, IconButton, Paper, Stack, Typography } from '@mui/material';
import { BudgetIF, SavingsBlob } from 'models/types';
import React, { useContext } from 'react';
import Chart from 'react-google-charts';
import { FirebaseContext } from '../../Firebase';
import { UserContext } from '../../App';
import EditableLabel from '../Inputs/EditableLabel';

const formatChartData = (blobsData: SavingsBlob[]) => {
  const formattedDataArr: any[][] = [['Name', 'Amount']];

  blobsData.forEach((blob) => {
    formattedDataArr.push([blob.name, blob.currentAmt]);
  });

  return formattedDataArr;
};

interface SavingsProps {
  budget: BudgetIF;
  getBudget: () => void;
}

const Savings = (props: SavingsProps): JSX.Element => {
  const firebase = useContext(FirebaseContext);
  const { profile } = useContext(UserContext);
  const { budget, getBudget } = props;

  const isBlobNameUnique = (newBlobName: string) => {
    return !budget.savingsBlobs.some((blob) => blob.name === newBlobName);
  };

  const saveUpdBlobsArr = (newArr: SavingsBlob[]) => {
    if (!profile?.budgetId) return;

    firebase
      .updateBudget(profile.budgetId, {
        savingsBlobs: newArr,
      })
      .then(() => getBudget());
  };

  const createSavingsBlob = () => {
    const updBlobsArr = [...budget.savingsBlobs];

    let newBlobName = 'New Blob';
    let nameIterator = 1;

    while (updBlobsArr.some((blob) => blob.name === newBlobName)) {
      newBlobName = `New Blob${nameIterator}`;
      nameIterator++;
    }

    updBlobsArr.push({ name: newBlobName, currentAmt: 0 });

    saveUpdBlobsArr(updBlobsArr);
  };

  const updateSavingsBlobName = (oldName: string, newName: string | undefined) => {
    if (!newName) return;

    const updBlobsArr = [...budget.savingsBlobs];
    updBlobsArr[updBlobsArr.findIndex((blob) => blob.name === oldName)].name = newName;

    saveUpdBlobsArr(updBlobsArr);
  };

  const updateSavingsBlobAmt = (blobName: string, newAmt: string | undefined) => {
    if (!newAmt) return;

    const updBlobsArr = [...budget.savingsBlobs];
    updBlobsArr[updBlobsArr.findIndex((blob) => blob.name === blobName)].currentAmt = parseFloat(newAmt);

    saveUpdBlobsArr(updBlobsArr);
  };

  const deleteSavingsBlob = (blobName: string) => {
    const updBlobsArr = [...budget.savingsBlobs];
    updBlobsArr.splice(
      updBlobsArr.findIndex((blob) => blob.name === blobName),
      1
    );

    saveUpdBlobsArr(updBlobsArr);
  };

  return (
    <Box mt={2} ml={1} mr={1}>
      <Typography variant='h3' mb={2}>
        Savings Blobs
      </Typography>

      <Paper sx={{ p: 1, maxWidth: 'auto', mb: 2 }}>
        <Typography variant='h4'>Total Saved:</Typography>
        <Typography variant='h5'>
          $
          {budget.savingsBlobs
            .reduce((sum, { currentAmt }) => sum + currentAmt, 0)
            .toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
        </Typography>
      </Paper>

      <Button variant='contained' startIcon={<Add />} onClick={createSavingsBlob}>
        Create New Blob
      </Button>

      <Stack mb={4} spacing={1} mt={2}>
        {budget.savingsBlobs.map((blob) => (
          <Paper sx={{ p: 1 }} key={blob.name}>
            <Stack direction='row' alignItems='center' justifyContent='space-between'>
              <EditableLabel
                fieldName='Blob name'
                fieldType='ItemName'
                text={blob.name}
                textVariant='h6'
                isValUnique={isBlobNameUnique}
                onSubmitValue={(newValue) => updateSavingsBlobName(blob.name, newValue)}
              />
              <IconButton sx={{ ml: 4 }} onClick={() => deleteSavingsBlob(blob.name)}>
                <Clear />
              </IconButton>
            </Stack>
            <EditableLabel
              fieldName='Amount'
              fieldType='DecimalNum'
              textVariant='body1'
              text={blob.currentAmt.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              isMonetaryValue
              onSubmitValue={(newValue) => updateSavingsBlobAmt(blob.name, newValue)}
            />
          </Paper>
        ))}
      </Stack>

      <Paper
        sx={{
          mb: 4,
          height: '25vw',
          '@media (max-width:600px)': { height: '100vw' },
        }}
      >
        <Chart
          chartType='PieChart'
          width='100%'
          height='100%'
          data={formatChartData(budget.savingsBlobs)}
          options={{ title: 'Savings Breakdown', pieHole: 0.5, is3D: false }}
        />
      </Paper>
    </Box>
  );
};

export default Savings;
