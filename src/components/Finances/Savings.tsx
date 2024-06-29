import {
  Box,
  Button,
  Card,
  CardBody,
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
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useMemo } from 'react';
import { MdAdd, MdMoreVert } from 'react-icons/md';
import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import Client from '../../Client';
import { IBudget, SavingsBlob } from '../../models/types';
import { useUserStore } from '../../state/UserStore';
import { genUuid, getCurrencyString, getNiceChartColor } from '../../utils/utils';
import EditableLabel from '../Inputs/EditableLabel';

interface SavingsProps {
  budget: IBudget;
}

const Savings = ({ budget }: SavingsProps) => {
  const family = useUserStore((state) => state.family);

  const savingsBreakdownChartData = useMemo(() => budget.savingsBlobs.map((blob, idx) => ({ name: blob.name, value: blob.currentAmt, fill: getNiceChartColor(idx) })), []);

  const isBlobNameUnique = (newBlobName: string) => {
    return !budget.savingsBlobs.some((blob) => blob.name === newBlobName);
  };

  const saveUpdBlobsArr = (newArr: SavingsBlob[]) => {
    if (!family?.budgetId) return;

    Client.updateBudget(family.budgetId, { savingsBlobs: newArr });
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

      <Stat w='50%' p={3} bgColor='green.400' borderRadius='md'>
        <StatLabel>Total Saved</StatLabel>
        <StatNumber>
          {getCurrencyString(budget.savingsBlobs.reduce((sum, { currentAmt }) => sum + currentAmt, 0))}
        </StatNumber>
      </Stat>

      <Button leftIcon={<MdAdd />} onClick={createSavingsBlob} m={4}>
        Create new Blob
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
                  text={getCurrencyString(blob.currentAmt, false)}
                  isMonetaryValue
                  onSubmitValue={(newValue) => updateSavingsBlobAmt(blob.name, newValue)}
                />
              </StatNumber>
            </Stat>
          </WrapItem>
        ))}
      </Wrap>

      {budget.savingsBlobs.length > 0 ? (
        <Card mt={8}>
          <CardBody>
            <Wrap align='center' justify='center'>
              <WrapItem>
                <div style={{ height: '400px', width: '400px', margin: 4 }}>
                  <Heading size='md' textAlign='center'>
                    Savings breakdown
                  </Heading>

                  <ResponsiveContainer width='85%'>
                    <PieChart>
                      <Pie
                        data={savingsBreakdownChartData}
                        dataKey="value"
                        outerRadius={100}
                        innerRadius={60}
                        label
                      />
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </WrapItem>
            </Wrap>
          </CardBody>
        </Card>
      ) : (
        <div>Add blobs and assign them money to see additional data!</div>
      )}
    </Box>
  );
};

export default Savings;
