import { MdAdd, MdClear } from 'react-icons/md';
import { useFirestoreDocumentMutation } from '@react-query-firebase/firestore';
import { db, FsCol } from '../../firebase';
import { doc } from 'firebase/firestore';
import { IBudget, SavingsBlob } from 'models/types';
import React from 'react';
import Chart from 'react-google-charts';
import { useUserStore } from 'state/UserStore';
import EditableLabel from '../Inputs/EditableLabel';
import { Box, Button, Heading, IconButton, Stack, Stat, StatLabel, StatNumber, Wrap, WrapItem } from '@chakra-ui/react';

const formatChartData = (blobsData: SavingsBlob[]) => {
  const formattedDataArr: (string | number)[][] = [['Name', 'Amount']];

  blobsData.forEach((blob) => {
    formattedDataArr.push([blob.name, blob.currentAmt]);
  });

  return formattedDataArr;
};

interface SavingsProps {
  budget: IBudget;
}

const Savings = ({ budget }: SavingsProps): JSX.Element => {
  const family = useUserStore((state) => state.family);

  const budgetDocMutation = useFirestoreDocumentMutation(doc(db, FsCol.Budgets, family?.budgetId ?? 'undefined'), {
    merge: true,
  });

  const isBlobNameUnique = (newBlobName: string) => {
    return !budget.savingsBlobs.some((blob) => blob.name === newBlobName);
  };

  const saveUpdBlobsArr = (newArr: SavingsBlob[]) => {
    if (!family?.budgetId) return;

    budgetDocMutation.mutate({
      savingsBlobs: newArr,
    });
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
      <Heading mb={2}>Savings Blobs</Heading>

      <Stat w='50%' p={3} bgColor='green.400' borderRadius='md'>
        <StatLabel>Total Saved</StatLabel>
        <StatNumber>
          $
          {budget.savingsBlobs
            .reduce((sum, { currentAmt }) => sum + currentAmt, 0)
            .toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
        </StatNumber>
      </Stat>

      <Button leftIcon={<MdAdd />} onClick={createSavingsBlob} m={4}>
        Create New Blob
      </Button>

      <Wrap mb={4}>
        {budget.savingsBlobs.map((blob) => (
          <WrapItem key={blob.name}>
            <Stat p={3} bgColor='green.300' borderRadius='md'>
              <StatLabel>
                <Stack direction='row' justifyContent='center' alignItems='center'>
                  <EditableLabel
                    fieldName='Blob name'
                    fieldType='ItemName'
                    text={blob.name}
                    textSize='lg'
                    isValUnique={isBlobNameUnique}
                    onSubmitValue={(newValue) => updateSavingsBlobName(blob.name, newValue)}
                  />
                  <IconButton
                    icon={<MdClear />}
                    variant='ghost'
                    fontSize={18}
                    onClick={() => deleteSavingsBlob(blob.name)}
                    size='sm'
                    aria-label='Delete savings blob'
                  />
                </Stack>
              </StatLabel>
              <StatNumber>
                <EditableLabel
                  fieldName='Amount'
                  fieldType='DecimalNum'
                  text={blob.currentAmt.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  isMonetaryValue
                  onSubmitValue={(newValue) => updateSavingsBlobAmt(blob.name, newValue)}
                />
              </StatNumber>
            </Stat>
          </WrapItem>
        ))}
      </Wrap>

      <Box
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
      </Box>
    </Box>
  );
};

export default Savings;
