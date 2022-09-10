import { Add, Clear, KeyboardArrowDown, SubdirectoryArrowRight } from '@mui/icons-material';
import {
  Box,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { BudgetCategory, IBudget, BudgetSubcategory } from 'models/types';
import React, { useContext, useState } from 'react';
import { Droppable, DropResult } from 'react-beautiful-dnd';
import { Draggable } from 'react-beautiful-dnd';
import { DragDropContext } from 'react-beautiful-dnd';
import { FirebaseContext } from '../../Firebase';
import { UserContext } from '../../App';
import EditableLabel from '../Inputs/EditableLabel';

// TODO: Put all this crap into FinancesContext or something to avoid prop spam and combine all the IFs
interface UltraSharedFuncProps {
  setSubCatProperty: (newValue: string | undefined, oldName: string, catName: string, propName: string) => void;
  removeSubCategory: (catName: string, subCatName: string) => void;
}

interface SharedFuncProps extends UltraSharedFuncProps {
  setCategoryName: (newName: string | undefined, curCatName: string) => void;
  addNewSubCategory: (catName: string) => void;
  removeCategory: (catName: string) => void;
}

interface BudgetCategoriesProps extends SharedFuncProps {
  budget: IBudget;
  moveCategory: (srcIdx: number, destIdx: number) => void;
  moveSubCategory: (srcCat: string, destCat: string, srcIdx: number, destIdx: number) => void;
}

const BudgetCategories = (props: BudgetCategoriesProps): JSX.Element => {
  const {
    budget,
    setCategoryName,
    addNewSubCategory,
    removeCategory,
    setSubCatProperty,
    removeSubCategory,
    moveCategory,
    moveSubCategory,
  } = props;

  const onDragEnd = ({ type, source, destination }: DropResult) => {
    if (!source || !destination || !type) return;

    if (type === 'category') {
      moveCategory(source.index, destination.index);
    } else if (type === 'subcategory') {
      const srcCat = source.droppableId.replace('subcats-', '');
      const destCat = destination.droppableId.replace('subcats-', '');

      moveSubCategory(srcCat, destCat, source.index, destination.index);
    }
  };

  const isCategoryNameUnique = (newCatName: string) => {
    return !budget.categories.some((cat) => cat.name === newCatName);
  };

  // TODO: handle identically named subcat being moved to the same cat as its twin
  const isSubcategoryNameUnique = (category: BudgetCategory, newSubcatName: string) => {
    return !category.subcategories.some((subcat) => subcat.name === newSubcatName);
  };

  return (
    <Box pt={1} pb={1}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId='budgetCats' type='category'>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {budget.categories.map((category, idx) => (
                <Category
                  key={category.name}
                  idx={idx}
                  category={category}
                  setCategoryName={setCategoryName}
                  addNewSubCategory={addNewSubCategory}
                  removeCategory={removeCategory}
                  setSubCatProperty={setSubCatProperty}
                  removeSubCategory={removeSubCategory}
                  isCategoryNameUnique={isCategoryNameUnique}
                  isSubcategoryNameUnique={isSubcategoryNameUnique}
                  isLastCat={idx === budget.categories.length - 1 ? true : false}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
};

interface CategoryProps extends SharedFuncProps {
  idx: number;
  category: BudgetCategory;
  isLastCat: boolean;
  isCategoryNameUnique: (newCatName: string) => boolean;
  isSubcategoryNameUnique: (category: BudgetCategory, newSubcatName: string) => boolean;
}

const Category = (props: CategoryProps): JSX.Element => {
  const {
    idx,
    category,
    isLastCat,
    setCategoryName,
    addNewSubCategory,
    removeCategory,
    setSubCatProperty,
    removeSubCategory,
    isCategoryNameUnique,
    isSubcategoryNameUnique,
  } = props;
  const [isHovered, setIsHovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  return (
    <Draggable draggableId={category.name} index={idx}>
      {(provided) => (
        <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
          <Box mb={1}>
            <Grid container alignItems='center'>
              <Grid item xs={6} onMouseOver={() => setIsHovered(true)} onMouseOut={() => setIsHovered(false)}>
                <Stack direction='row' alignItems='center'>
                  <EditableLabel
                    fieldName='Category'
                    fieldType='ItemName'
                    textVariant='h5'
                    text={category.name}
                    isValUnique={isCategoryNameUnique}
                    onSubmitValue={(newValue) => setCategoryName(newValue, category.name)}
                  />

                  <IconButton
                    onClick={(event) => setAnchorEl(event.currentTarget)}
                    sx={{
                      display: isHovered ? 'inherit' : 'none',
                      p: 0,
                      ml: 1,
                    }}
                  >
                    <KeyboardArrowDown sx={{ fontSize: 30 }} />
                  </IconButton>
                  <Menu id={`cat${idx}-menu`} anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
                    <MenuItem onClick={() => addNewSubCategory(category.name)}>Add sub-category</MenuItem>
                    <MenuItem onClick={() => removeCategory(category.name)}>Delete category</MenuItem>
                  </Menu>
                </Stack>
              </Grid>
              <Grid item xs={3}>
                <Typography variant='body1' ml={1} sx={{ fontWeight: 'bold' }}>
                  $
                  {category.totalAllotted?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
              </Grid>
              <Grid item xs={2} ml={1}>
                <Typography variant='body1' ml={1} sx={{ fontWeight: 'bold' }}>
                  $
                  {category.currentSpent?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
              </Grid>
            </Grid>

            <Droppable droppableId={`subcats-${category.name}`} type='subcategory'>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {category.subcategories.map((subcategory, subidx) => (
                    <SubCategory
                      key={subcategory.name}
                      subidx={subidx}
                      category={category}
                      subcategory={subcategory}
                      setSubCatProperty={setSubCatProperty}
                      removeSubCategory={removeSubCategory}
                      isSubcategoryNameUnique={isSubcategoryNameUnique}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {!isLastCat && <Divider />}
          </Box>
        </div>
      )}
    </Draggable>
  );
};

interface SubCategoryProps extends UltraSharedFuncProps {
  subidx: number;
  category: BudgetCategory;
  subcategory: BudgetSubcategory;
  isSubcategoryNameUnique: (category: BudgetCategory, newSubcatName: string) => boolean;
}

const SubCategory = (props: SubCategoryProps): JSX.Element => {
  const { subidx, category, subcategory, setSubCatProperty, removeSubCategory, isSubcategoryNameUnique } = props;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Draggable draggableId={subcategory.name} index={subidx}>
      {(provided) => (
        <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
          <Box ml={2} mb={1}>
            <Grid container alignItems='center'>
              <Grid item xs={6} onMouseOver={() => setIsHovered(true)} onMouseOut={() => setIsHovered(false)}>
                <Stack direction='row' alignItems='center'>
                  <EditableLabel
                    fieldName='Subcategory'
                    fieldType='ItemName'
                    isValUnique={(valToCheck) => isSubcategoryNameUnique(category, valToCheck)}
                    text={subcategory.name}
                    onSubmitValue={(newValue) => setSubCatProperty(newValue, subcategory.name, category.name, 'name')}
                  />
                  <IconButton
                    onClick={() => removeSubCategory(category.name, subcategory.name)}
                    sx={{
                      display: isHovered ? 'inherit' : 'none',
                      p: 0.5,
                      ml: 0.5,
                      mt: 0.4,
                    }}
                  >
                    <Clear sx={{ fontSize: 20 }} />
                  </IconButton>
                </Stack>
                <LinearProgress
                  value={(subcategory.currentSpent / subcategory.totalAllotted) * 100}
                  variant='determinate'
                  sx={{ width: '85%', mt: 1 }}
                />
              </Grid>

              <Grid item xs={3}>
                <EditableLabel
                  fieldName='Total allotted'
                  fieldType='DecimalNum'
                  textVariant='body1'
                  isMonetaryValue
                  text={subcategory.totalAllotted.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  onSubmitValue={(newValue) => setSubCatProperty(newValue, subcategory.name, category.name, 'allotted')}
                />
              </Grid>
              <Grid item xs={2} ml={1.5}>
                <Typography variant='body1'>
                  $
                  {subcategory.currentSpent.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </div>
      )}
    </Draggable>
  );
};

interface BudgetProps {
  budget: IBudget;
  setBudget: (newBudget: IBudget) => void;
  getBudget: () => void;
}

const Budget = (props: BudgetProps): JSX.Element => {
  const firebase = useContext(FirebaseContext);
  const { family } = useContext(UserContext);
  const { budget, setBudget, getBudget } = props;
  const theme = useTheme();

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
          <Box sx={{ position: 'sticky', top: 60, backgroundColor: '#fbfbfb', zIndex: 1000 }}>
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

          <BudgetCategories
            budget={budget}
            setCategoryName={setCategoryName}
            addNewSubCategory={addNewSubCategory}
            removeCategory={removeCategory}
            setSubCatProperty={setSubCatProperty}
            removeSubCategory={removeSubCategory}
            moveCategory={moveCategory}
            moveSubCategory={moveSubCategory}
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default Budget;
