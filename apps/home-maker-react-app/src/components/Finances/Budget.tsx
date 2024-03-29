import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Stack,
  Text,
  Tooltip,
  useColorMode,
  useColorModeValue,
  useToken,
} from '@chakra-ui/react';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useMemo, useRef, useState } from 'react';
import Chart from 'react-google-charts';
import { MdAdd, MdSubdirectoryArrowRight } from 'react-icons/md';
import { FsCol, db } from '../../firebase';
import { BudgetCategory, BudgetContextValue, BudgetSubcategory, IBudget, Transaction } from '../../models/types';
import { useUserStore } from '../../state/UserStore';
import { genUuid, getAbsDiffAndComparisonOfMonetaryValues, moveMonth } from '../../utils/utils';
import AddTransaction from '../Forms/AddTransaction';
import EditableLabel from '../Inputs/EditableLabel';
import BudgetCategories from './BudgetComponents/BudgetCategories';
import { InfoOutlineIcon } from '@chakra-ui/icons';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

export const BudgetContext = React.createContext({} as BudgetContextValue);

export const budgetRowsGridTemplateColumns = '3fr 1fr 1fr';

interface BudgetProps {
  budget: IBudget;
  setBudget: (newBudget: IBudget) => void;
  curBudgetMonthAndYear: Date;
  setBudgetCurMonthAndYear: (newDate: Date) => void;
}

const Budget = (props: BudgetProps) => {
  const { budget, setBudget, curBudgetMonthAndYear, setBudgetCurMonthAndYear } = props;
  const isLightMode = useColorMode().colorMode === 'light';
  const pieChartBgColor = useColorModeValue('gray.200', 'gray.600');
  const [red500, green400, yellow300] = useToken('colors', ['red.500', 'green.400', 'yellow.300']);

  const family = useUserStore((state) => state.family);

  const [addingTransaction, setAddingTransaction] = useState(false);
  const [catSubcatKey, setCatSubcatKey] = useState('');
  const [itemToRemove, setItemToRemove] = useState<[string, string | undefined]>(); // [catName, subCatName]
  const cancelRef = useRef(null);

  const saveUpdatedCategories = (categories: BudgetCategory[], transactions?: Transaction[]) => {
    if (!family?.budgetId) return;

    const budgetMergeObj: Partial<IBudget> = {
      categories,
    };

    if (transactions) {
      budgetMergeObj.transactions = transactions;
    }

    updateDoc(doc(db, FsCol.Budgets, family.budgetId), budgetMergeObj);
  };

  const setMonthlyNetIncome = (newValue?: string) => {
    if (!family?.budgetId || !newValue) return;

    updateDoc(doc(db, FsCol.Budgets, family.budgetId), {
      monthlyNetIncome: parseFloat(newValue),
    });
  };

  const setCategoryName = (newValue: string | undefined, oldName: string) => {
    if (!family?.budgetId || !newValue) return;
    if (newValue === oldName) return;

    const updArr = [...budget.categories];
    updArr[updArr.findIndex((cat) => cat.name === oldName)].name = newValue;

    // Update any transactions w/ this cat
    const updTransactions = [...budget.transactions];
    updTransactions.forEach((t) => {
      if (t.category === oldName) {
        t.category = newValue;
      }
    });

    saveUpdatedCategories(updArr, updTransactions);
  };

  const setSubCatProperty = (newValue: string | undefined, oldName: string, catName: string, propName: string) => {
    if (!family?.budgetId || !newValue || newValue === oldName) return;

    const updArr = [...budget.categories];
    const updTransactions = [...budget.transactions];

    updArr.forEach((cat) => {
      if (cat.name === catName) {
        cat.subcategories.forEach((subCat: BudgetSubcategory) => {
          if (subCat.name === oldName) {
            if (propName === 'name') {
              updTransactions.forEach((t) => {
                if (t.category === catName && t.subcategory === oldName) {
                  t.subcategory = newValue;
                }
              });

              subCat.name = newValue;
            } else if (propName === 'allotted') {
              subCat.totalAllotted = parseFloat(newValue);
            } else {
              console.error('Invalid property to set for subcat');
            }
          }
        });
      }
    });

    saveUpdatedCategories(updArr, updTransactions);
  };

  const addNewCategory = () => {
    if (!family?.budgetId) return;

    let newCatName = 'New Category';
    let nameIterator = 1;

    while (budget.categories.some((cat: BudgetCategory) => cat.name === newCatName)) {
      newCatName = `New Category${nameIterator}`;
      nameIterator++;
    }

    saveUpdatedCategories([...budget.categories, { uid: genUuid(), name: newCatName, subcategories: [] }]);
  };

  const removeCategory = (catName: string) => {
    if (!family?.budgetId) return;

    const updArr = [...budget.categories];
    const updTransactions = [...budget.transactions];

    updArr.splice(
      updArr.findIndex((cat) => cat.name === catName),
      1
    );

    updTransactions.forEach((t) => {
      if (t.category === catName) {
        t.category = 'N/A';
      }
    });

    saveUpdatedCategories(updArr, updTransactions);
  };

  const addNewSubCategory = (catName: string) => {
    if (!family?.budgetId) return;

    const updArr = [...budget.categories];

    updArr.forEach((cat) => {
      if (cat.name === catName) {
        let newSubCatName = 'New SubCategory';
        let nameIterator = 1;

        while (cat.subcategories.some((subcat: BudgetSubcategory) => subcat.name === newSubCatName)) {
          newSubCatName = `New SubCategory${nameIterator}`;
          nameIterator++;
        }

        cat.subcategories.push({
          uid: genUuid(),
          name: newSubCatName,
          currentSpent: 0,
          totalAllotted: 0,
        });
      }
    });

    saveUpdatedCategories(updArr);
  };

  const removeSubCategory = (catName: string, subCatName: string) => {
    if (!family?.budgetId) return;

    const updArr = [...budget.categories];
    const updTransactions = [...budget.transactions];

    updArr.forEach((cat) => {
      if (cat.name === catName) {
        cat.subcategories.splice(
          cat.subcategories.findIndex((subcat: BudgetSubcategory) => subcat.name === subCatName),
          1
        );
      }
    });

    updTransactions.forEach((t) => {
      if (t.category === catName && t.subcategory === subCatName) {
        t.subcategory = 'N/A';
      }
    });

    saveUpdatedCategories(updArr, updTransactions);
  };

  const moveCategory = (dragIdx: number, dropIdx: number) => {
    if (!family?.budgetId) return;

    const updArr = [...budget.categories];
    const cat = updArr[dragIdx];

    updArr.splice(dragIdx, 1);
    updArr.splice(dropIdx, 0, cat);

    const newBudget = { ...budget };
    newBudget.categories = updArr;
    setBudget(newBudget);

    saveUpdatedCategories(updArr);
  };

  const moveSubCategory = (srcCatName: string, destCatName: string, dragIdx: number, dropIdx: number) => {
    // Src & Dest cat is used to handle subcat being moved to a different cat
    if (!family?.budgetId) return;

    const updArr = [...budget.categories];
    const srcCatIdx = updArr.findIndex((cat) => cat.name === srcCatName);
    const destCatIdx = updArr.findIndex((cat) => cat.name === destCatName);
    const subcat = updArr[srcCatIdx].subcategories[dragIdx];

    updArr[srcCatIdx].subcategories.splice(dragIdx, 1);
    updArr[destCatIdx].subcategories.splice(dropIdx, 0, subcat);

    const newBudget = { ...budget };
    newBudget.categories = updArr;
    setBudget(newBudget);

    saveUpdatedCategories(updArr);
  };

  const allottedRemainder = useMemo(() => {
    if (!budget.totalAllotted) return;
    let helperColor: string | undefined = undefined;
    let helperText = 'to allot';

    const [allottedRemainderStatus, differenceString] = getAbsDiffAndComparisonOfMonetaryValues(
      budget.totalAllotted,
      budget.monthlyNetIncome
    );

    if (allottedRemainderStatus === 'under') {
      helperColor = yellow300;
    } else if (allottedRemainderStatus === 'over') {
      helperText = 'over-allotted';
      helperColor = red500;
    }

    return (
      <Text color={helperColor} ml={-3}>
        ${differenceString} {helperText}
      </Text>
    );
  }, [budget.monthlyNetIncome, budget.totalAllotted, red500, yellow300]);

  const spendingRemainder = useMemo(() => {
    if (budget.totalAllotted === undefined || budget.totalSpent === undefined) return;

    let helperColor: string | undefined = undefined;
    let helperText = 'remaining';

    const [spendingRemainderStatus, differenceString] = getAbsDiffAndComparisonOfMonetaryValues(
      budget.totalSpent,
      budget.totalAllotted
    );

    if (spendingRemainderStatus === 'under') {
      helperColor = green400;
    } else if (spendingRemainderStatus === 'over') {
      helperText = 'over-budget';
      helperColor = red500;
    }

    return (
      <Text color={helperColor} ml={-1}>
        ${differenceString} {helperText}
      </Text>
    );
  }, [budget.totalAllotted, budget.totalSpent, green400, red500]);

  const formatChartData = (budgetCats: BudgetCategory[]) => {
    const formattedDataArr: (string | number)[][] = [['Category', 'Percent']];

    budgetCats.forEach((cat) => {
      if (cat.totalAllotted && budget.totalAllotted) {
        formattedDataArr.push([cat.name, (cat.totalAllotted / budget.totalAllotted) * 100]);
      }
    });

    return formattedDataArr;
  };

  if (!family?.budgetId) {
    return null;
  }

  return (
    <Box>
      <Stack direction='row' justifyContent='center' alignItems='center' mb={4} mt={2}>
        {!family.settings.showAllTransactionsOnCurrentMonth && (
          <IconButton
            icon={<HiChevronLeft />}
            aria-label='Previous month'
            onClick={() => setBudgetCurMonthAndYear(moveMonth(curBudgetMonthAndYear, 'backward'))}
            fontSize={20}
            boxSize={6}
          />
        )}

        <Heading>
          {curBudgetMonthAndYear.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </Heading>

        {!family.settings.showAllTransactionsOnCurrentMonth && (
          <IconButton
            icon={<HiChevronRight />}
            aria-label='Next month'
            onClick={() => setBudgetCurMonthAndYear(moveMonth(curBudgetMonthAndYear, 'forward'))}
            fontSize={20}
            boxSize={6}
          />
        )}
      </Stack>

      <Box mb={4} width={325} mx='auto'>
        <Box sx={{ p: 2 }}>
          <Stack direction='row' alignContent='center' spacing={2} mb={2}>
            <Text>Net Income</Text>
            <EditableLabel
              fieldName='Monthly net income'
              fieldType='DecimalNum'
              textSize='xl'
              isMonetaryValue
              text={budget.monthlyNetIncome.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              onSubmitValue={setMonthlyNetIncome}
            />
          </Stack>

          <Stack direction='row' alignContent='center' spacing={2}>
            <Text>Total Allotted</Text>
            <Text>
              $
              {budget.totalAllotted?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </Stack>
          {allottedRemainder}

          <Stack direction='row' alignContent='center' spacing={2} mt={1}>
            <Text>Total Spent</Text>
            <Text>
              $
              {budget.totalSpent?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </Stack>
          <Stack direction='row' alignContent='center' alignItems='center' justifyContent='center' spacing={1}>
            {spendingRemainder}
            <Tooltip label='(of total allotted)'>
              <InfoOutlineIcon boxSize={3} />
            </Tooltip>
          </Stack>
        </Box>
      </Box>

      <Box>
        <Box position='sticky' top='64px' zIndex={10} bgColor='green.400' pt={1} pb={1}>
          <Grid templateColumns={budgetRowsGridTemplateColumns} alignItems='center' gridColumnGap={1}>
            <GridItem w='100%'>
              <Stack direction='row' alignItems='center' spacing={0}>
                <Tooltip title='Add category'>
                  <IconButton
                    icon={<MdAdd />}
                    onClick={addNewCategory}
                    variant='ghost'
                    fontSize={24}
                    aria-label='Add category'
                  />
                </Tooltip>

                <Stack width='100%' alignItems='start' spacing={0}>
                  <Text>Category</Text>
                  <Stack direction='row' alignItems='end' ml={4}>
                    <MdSubdirectoryArrowRight />
                    <Text>Sub-category</Text>
                  </Stack>
                </Stack>
              </Stack>
            </GridItem>

            <GridItem ml={1} w='100%'>
              <Text>Allotted</Text>
            </GridItem>
            <GridItem w='100%'>
              <Text>Spent</Text>
            </GridItem>
          </Grid>
        </Box>

        <BudgetContext.Provider
          value={{
            budget,
            moveCategory,
            moveSubCategory,
            setCategoryName,
            addNewSubCategory,
            setSubCatProperty,
            setItemToRemove,
            setAddingTransaction,
            setCatSubcatKey,
          }}
        >
          <BudgetCategories />
        </BudgetContext.Provider>
      </Box>

      <Box mt={4} height={['100vw', '30vw']} bgColor={pieChartBgColor}>
        <Chart
          chartType='PieChart'
          width='100%'
          height='100%'
          data={formatChartData(budget.categories)}
          options={{
            title: 'Percent of Allotted Budget',
            is3D: false,
            ...getCommonChartOptions(isLightMode),
          }}
        />
      </Box>

      <AddTransaction
        isOpen={addingTransaction}
        setIsOpen={setAddingTransaction}
        budget={budget}
        initialCatSubcat={catSubcatKey}
      />

      <AlertDialog isOpen={!!itemToRemove} leastDestructiveRef={cancelRef} onClose={() => setItemToRemove(undefined)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete {itemToRemove && itemToRemove[1] !== undefined ? 'subcategory' : 'category'}
            </AlertDialogHeader>

            <AlertDialogBody>{`Are you sure you want to delete${
              itemToRemove && itemToRemove[1] !== undefined ? ` subcategory ${itemToRemove[1]} in` : ''
            } category ${itemToRemove && itemToRemove[0]}?`}</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setItemToRemove(undefined)}>
                Cancel
              </Button>
              <Button
                colorScheme='red'
                onClick={() => {
                  if (itemToRemove) {
                    if (itemToRemove[1] === undefined) {
                      removeCategory(itemToRemove[0]);
                    } else {
                      removeSubCategory(itemToRemove[0], itemToRemove[1]);
                    }
                  }

                  setItemToRemove(undefined);
                }}
                ml={3}
              >
                Remove
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export const getCommonChartOptions = (isLightMode: boolean) => ({
  backgroundColor: 'transparent',
  hAxis: {
    textStyle: {
      color: isLightMode ? 'black' : 'white',
    },
  },
  vAxis: {
    textStyle: {
      color: isLightMode ? 'black' : 'white',
    },
  },
  legend: {
    textStyle: {
      color: isLightMode ? 'black' : 'white',
    },
  },
  titleTextStyle: {
    color: isLightMode ? 'black' : 'white',
  },
});

export default Budget;
