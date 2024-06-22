import {
  Box,
  Button,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  Wrap,
  WrapItem,
  useColorMode,
} from '@chakra-ui/react';
import { doc, updateDoc } from 'firebase/firestore';
import Chart from 'react-google-charts';
import { MdAdd, MdMoreVert } from 'react-icons/md';
import { FsCol, db } from '../../firebase';
import { IBudget, SavingsBlob } from '../../models/types';
import { useUserStore } from '../../state/UserStore';
import { genUuid } from '../../utils/utils';
import EditableLabel from '../Inputs/EditableLabel';
import { getCommonChartOptions } from './Budget';

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

const Savings = ({ budget }: SavingsProps) => {
  const family = useUserStore((state) => state.family);
  const isLightMode = useColorMode().colorMode === 'light';

  const isBlobNameUnique = (newBlobName: string) => {
    return !budget.savingsBlobs.some((blob) => blob.name === newBlobName);
  };

  const saveUpdBlobsArr = (newArr: SavingsBlob[]) => {
    if (!family?.budgetId) return;

    updateDoc(doc(db, FsCol.Budgets, family.budgetId), {
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

    updBlobsArr.push({ uid: genUuid(), name: newBlobName, currentAmt: 0 });

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
      <Heading mb={4}>Savings Blobs</Heading>

      <Text mb={4}>Keep track of what your savings and investments are for</Text>

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
          <WrapItem key={blob.uid}>
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

                  <Menu>
                    <MenuButton
                      as={IconButton}
                      aria-label='Options'
                      icon={<MdMoreVert />}
                      variant='ghost'
                      size='sm'
                      fontSize={18}
                    />
                    <MenuList>
                      <MenuItem onClick={() => deleteSavingsBlob(blob.name)}>Delete</MenuItem>
                    </MenuList>
                  </Menu>
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

      {budget.savingsBlobs.length > 0 ? (
        <Box mb={4} height={['100vw', '75vw', '50vw', '25vw']}>
          <Chart
            chartType='PieChart'
            width='100%'
            height='100%'
            data={formatChartData(budget.savingsBlobs)}
            options={{ title: 'Savings Breakdown', pieHole: 0.5, is3D: false, ...getCommonChartOptions(isLightMode) }}
          />
        </Box>
      ) : (
        <div>Add blobs and assign them money to see additional data!</div>
      )}
    </Box>
  );
};

export default Savings;
