import { Add, SubdirectoryArrowRight } from '@mui/icons-material';
import { Box, Divider, Grid, IconButton, Paper, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { BudgetCategory, IBudget, BudgetSubcategory, BudgetContextValue } from 'models/types';
import React, { useState } from 'react';
import EditableLabel from '../Inputs/EditableLabel';
import Chart from 'react-google-charts';
import AddTransaction from 'components/Forms/AddTransaction';
import BudgetCategories from './BudgetComponents/BudgetCategories';
import { useAppStore } from 'state/AppStore';
import { useUserStore } from 'state/UserStore';

export const BudgetContext = React.createContext({} as BudgetContextValue);

interface BudgetProps {
  budget: IBudget;
  setBudget: (newBudget: IBudget) => void;
  getBudget: () => void;
}

const Budget = (props: BudgetProps): JSX.Element => {
  const { budget, setBudget, getBudget } = props;
  const theme = useTheme();

  const firebase = useAppStore((state) => state.firebase);
  const family = useUserStore((state) => state.family);

  const [addingTransaction, setAddingTransaction] = useState(false);
  const [catSubcatKey, setCatSubcatKey] = useState('');

  const setMonthlyNetIncome = (newValue: string | undefined) => {
    if (!family?.budgetId || !newValue) return;

    firebase
      .updateBudget(family.budgetId, {
        monthlyNetIncome: parseFloat(newValue),
      })
      .then(() => getBudget());
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

    firebase
      .updateBudget(family.budgetId, {
        categories: updArr,
        transactions: updTransactions,
      })
      .then(() => getBudget());
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

    firebase
      .updateBudget(family.budgetId, {
        categories: updArr,
        transactions: updTransactions,
      })
      .then(() => getBudget());
  };

  const addNewCategory = () => {
    if (!family?.budgetId) return;

    let newCatName = 'New Category';
    let nameIterator = 1;

    while (budget.categories.some((cat: BudgetCategory) => cat.name === newCatName)) {
      newCatName = `New Category${nameIterator}`;
      nameIterator++;
    }

    firebase
      .updateBudget(family.budgetId, {
        categories: [...budget.categories, { name: newCatName, subcategories: [] }],
      })
      .then(() => getBudget());
  };

  const removeCategory = (catName: string) => {
    if (!family?.budgetId) return;

    if (!window.confirm(`Are you sure you want to delete category ${catName}?`)) return;

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

    firebase
      .updateBudget(family.budgetId, {
        categories: updArr,
        transactions: updTransactions,
      })
      .then(() => getBudget());
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
          name: newSubCatName,
          currentSpent: 0,
          totalAllotted: 0,
        });
      }
    });

    firebase
      .updateBudget(family.budgetId, {
        categories: updArr,
      })
      .then(() => getBudget());
  };

  const removeSubCategory = (catName: string, subCatName: string) => {
    if (!family?.budgetId) return;

    if (!window.confirm(`Are you sure you want to delete subcategory ${subCatName} in category ${catName}?`)) return;

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

    firebase
      .updateBudget(family.budgetId, {
        categories: updArr,
        transactions: updTransactions,
      })
      .then(() => getBudget());
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

    firebase
      .updateBudget(family.budgetId, {
        categories: updArr,
      })
      .then(() => getBudget());
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

    firebase
      .updateBudget(family.budgetId, {
        categories: updArr,
      })
      .then(() => getBudget());
  };

  const setBudgetName = (newName: string | undefined) => {
    if (!family?.budgetId || !newName) return;

    firebase.updateBudget(family.budgetId, { name: newName }).then(() => getBudget());
  };

  const getAllottedRemainder = () => {
    if (!budget.totalAllotted) return;

    const difference = budget.monthlyNetIncome - budget.totalAllotted;
    let helperColor: string | undefined = '';
    let helperText = 'to allot';

    if (difference > 0) {
      helperColor = theme.palette.warning.main;
    } else if (difference === 0) {
      helperColor = undefined;
    } else {
      helperText = 'over-allotted';
      helperColor = theme.palette.error.main;
    }

    return (
      <Typography variant='subtitle1' ml={3} color={helperColor}>
        $
        {Math.abs(difference).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}{' '}
        {helperText}
      </Typography>
    );
  };

  const getSpendingRemainder = () => {
    if (!budget.totalAllotted || !budget.totalSpent) return;

    const difference = budget.totalAllotted - budget.totalSpent;
    let helperColor: string | undefined = '';
    let helperText = 'remaining';

    if (difference > 0) {
      helperColor = theme.palette.success.main;
    } else if (difference === 0) {
      helperColor = undefined;
    } else {
      helperText = 'over-budget';
      helperColor = theme.palette.error.main;
    }

    return (
      <Typography variant='subtitle1' ml={3} color={helperColor}>
        $
        {Math.abs(difference).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}{' '}
        {helperText}
      </Typography>
    );
  };

  const formatChartData = (budgetCats: BudgetCategory[]) => {
    const formattedDataArr: (string | number)[][] = [['Category', 'Percent']];

    budgetCats.forEach((cat) => {
      if (cat.totalAllotted && budget.totalAllotted) {
        formattedDataArr.push([cat.name, (cat.totalAllotted / budget.totalAllotted) * 100]);
      }
    });

    return formattedDataArr;
  };

  return (
    <Box key={budget.id} maxWidth='xl' mx='auto'>
      <Box textAlign='center' mb={4} mt={2} width={300} mx='auto'>
        <EditableLabel
          fieldName='Budget name'
          fieldType='ItemName'
          isValUnique={() => true}
          textVariant='h3'
          text={budget.name}
          onSubmitValue={setBudgetName}
        />
        <Typography variant='h5'>
          {new Date().toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </Typography>
      </Box>

      <Box mb={4} width={325} mx='auto'>
        <Paper sx={{ p: 2 }}>
          <Stack direction='row' alignContent='center' spacing={2} mb={2}>
            <Typography variant='h6'>Net Income</Typography>
            <EditableLabel
              fieldName='Monthly net income'
              fieldType='DecimalNum'
              textVariant='h5'
              isMonetaryValue
              text={budget.monthlyNetIncome.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              onSubmitValue={setMonthlyNetIncome}
            />
          </Stack>

          <Stack direction='row' alignContent='center' spacing={2}>
            <Typography variant='h6'>Total Allotted</Typography>
            <Typography variant='h5'>
              $
              {budget.totalAllotted?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Stack>
          {getAllottedRemainder()}

          <Stack direction='row' alignContent='center' spacing={2} mt={1}>
            <Typography variant='h6'>Total Spent</Typography>
            <Typography variant='h5'>
              $
              {budget.totalSpent?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Stack>
          {getSpendingRemainder()}
        </Paper>
      </Box>

      <Box>
        <Paper sx={{ p: 1 }}>
          <Box sx={{ position: 'sticky', top: 60, backgroundColor: theme.palette.primary.light, zIndex: 1000 }}>
            <Grid container alignItems='center' sx={{ p: 1 }}>
              <Grid item xs={6}>
                <Stack direction='row' alignItems='center'>
                  <Tooltip title='Add category'>
                    <IconButton onClick={addNewCategory}>
                      <Add />
                    </IconButton>
                  </Tooltip>

                  <Stack>
                    <Typography variant='body1'>Category</Typography>
                    <Stack direction='row' alignItems='end'>
                      <SubdirectoryArrowRight />
                      <Typography variant='body2'>Sub-category</Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={3} ml={1}>
                <Typography variant='body1'>Allotted</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant='body1'>Spent</Typography>
              </Grid>
            </Grid>

            <Divider />
          </Box>

          <BudgetContext.Provider
            value={{
              budget,
              moveCategory,
              moveSubCategory,
              setCategoryName,
              addNewSubCategory,
              removeCategory,
              setSubCatProperty,
              removeSubCategory,
              setAddingTransaction,
              setCatSubcatKey,
            }}
          >
            <BudgetCategories />
          </BudgetContext.Provider>
        </Paper>
      </Box>

      <Paper
        sx={{
          mt: 4,
          height: '25vw',
          '@media (max-width:600px)': { height: '100vw' },
        }}
      >
        <Chart
          chartType='PieChart'
          width='100%'
          height='100%'
          data={formatChartData(budget.categories)}
          options={{ title: 'Percent of Allotted Budget', is3D: false }}
        />
      </Paper>

      <AddTransaction
        isOpen={addingTransaction}
        setIsOpen={setAddingTransaction}
        budget={budget}
        getBudget={getBudget}
        initialCatSubcat={catSubcatKey}
      />
    </Box>
  );
};

export default Budget;
