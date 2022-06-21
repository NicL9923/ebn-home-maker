import { Add, Clear, KeyboardArrowDown, SubdirectoryArrowRight } from '@mui/icons-material';
import { Box, Divider, Grid, IconButton, LinearProgress, Menu, MenuItem, Paper, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { doc, setDoc } from 'firebase/firestore';
import React, { useContext, useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Draggable } from 'react-beautiful-dnd';
import { DragDropContext } from 'react-beautiful-dnd';
import { FirebaseContext } from '..';
import { UserContext } from '../App';
import EditableLabel from './EditableLabel';


const BudgetCategories = (props) => {
    const { budget, setCategoryName, addNewSubCategory, removeCategory, setSubCatProperty, removeSubCategory, moveCategory, moveSubCategory } = props;

    const onDragEnd = ({ type, source, destination }) => {
        if (!source || !destination || !type) return;

        if (type === 'category') {
            moveCategory(source.index, destination.index);
        }
        else if (type === 'subcategory') {
            const srcCat = source.droppableId.replace('subcats-', '');
            const destCat = destination.droppableId.replace('subcats-', '');

            moveSubCategory(srcCat, destCat, source.index, destination.index);
        }
    };
    
    return (
        <Box p={2}>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId='budgetCats' type='category'>
                    {(provided) =>
                        <div { ...provided.droppableProps } ref={provided.innerRef}>
                            { budget.categories.map((category, idx) => 
                                <Category
                                    key={category.name}
                                    idx={idx}
                                    category={category}
                                    setCategoryName={setCategoryName}
                                    addNewSubCategory={addNewSubCategory}
                                    removeCategory={removeCategory}
                                    setSubCatProperty={setSubCatProperty}
                                    removeSubCategory={removeSubCategory}
                                    isLastCat={(idx === budget.categories.length - 1) ? true : false}
                                />
                            )}
                            {provided.placeholder}
                        </div>
                    }
                </Droppable>
            </DragDropContext>
        </Box>
    );
};

const Category = (props) => {
    const { idx, category, setCategoryName, addNewSubCategory, removeCategory, setSubCatProperty, removeSubCategory, isLastCat } = props;
    const [isHovered, setIsHovered] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    return (
        <Draggable draggableId={category.name} index={idx}>
            {(provided) =>
                <div { ...provided.draggableProps } { ...provided.dragHandleProps } ref={provided.innerRef}>
                    <Box mb={1}>
                        <Grid container alignItems='center'>
                            <Grid item xs={6} onMouseOver={() => setIsHovered(true)} onMouseOut={() => setIsHovered(false)}>
                                <Stack direction='row' alignItems='center'>
                                    <EditableLabel variant='h5' initialValue={category.name} onBlur={(newValue) => setCategoryName(newValue, category.name)} />

                                    <IconButton onClick={(event) => setAnchorEl(event.currentTarget)} sx={{ display: isHovered ? 'inherit' : 'none', p: 0, ml: 1 }}><KeyboardArrowDown sx={{ fontSize: 30 }} /></IconButton>
                                    <Menu id={`cat${idx}-menu`} anchorEl={anchorEl} open={anchorEl} onClose={() => setAnchorEl(null)}>
                                        <MenuItem onClick={() => addNewSubCategory(category.name)}>Add sub-category</MenuItem>
                                        <MenuItem onClick={() => removeCategory(category.name)}>Delete category</MenuItem>
                                    </Menu>
                                </Stack>
                            </Grid>
                            <Grid item xs={3}>
                                <Typography variant='body1' ml={1} sx={{ fontWeight: 'bold' }}>${category.totalAllotted.toFixed(2)}</Typography>
                            </Grid>
                            <Grid item xs={2} ml={1}>
                                <Typography variant='body1' ml={1} sx={{ fontWeight: 'bold' }}>${category.currentSpent.toFixed(2)}</Typography>
                            </Grid>
                        </Grid>

                        <Droppable droppableId={`subcats-${category.name}`} type='subcategory'>
                            {(provided) =>
                                <div { ...provided.droppableProps } ref={provided.innerRef}>
                                    {category.subcategories.map((subcategory, subidx) => 
                                        <SubCategory
                                            key={subcategory.name}
                                            subidx={subidx}
                                            category={category}
                                            subcategory={subcategory}
                                            setSubCatProperty={setSubCatProperty}
                                            removeSubCategory={removeSubCategory}
                                        />
                                    )}
                                    {provided.placeholder}
                                </div>
                            }
                        </Droppable>
                        
                        { !isLastCat && <Divider /> }
                    </Box>
                </div>
            }
        </Draggable>
    );
};

const SubCategory = (props) => {
    const { subidx, category, subcategory, setSubCatProperty, removeSubCategory } = props;
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Draggable draggableId={subcategory.name} index={subidx}>
            {(provided) =>
                <div { ...provided.draggableProps } { ...provided.dragHandleProps } ref={provided.innerRef}>
                    <Box ml={2} mb={1}>
                        <Grid container alignItems='center'>
                            <Grid item xs={6} onMouseOver={() => setIsHovered(true)} onMouseOut={() => setIsHovered(false)}>
                                <Stack direction='row' alignItems='center'>
                                    <EditableLabel initialValue={subcategory.name} onBlur={(newValue) => setSubCatProperty(newValue, subcategory.name, category.name, 'name')} />
                                    <IconButton onClick={() => removeSubCategory(category.name, subcategory.name)} sx={{ display: isHovered ? 'inherit' : 'none', p: 0.5, ml: 0.5, mt: 0.4 }}><Clear sx={{ fontSize: 20 }} /></IconButton>
                                </Stack>
                                <LinearProgress value={(subcategory.currentSpent / subcategory.totalAllotted) * 100} variant='determinate' sx={{ width: '85%', mt: 1 }} />
                            </Grid>

                            <Grid item xs={3}>
                                <EditableLabel variant='body1' prefix='$' initialValue={subcategory.totalAllotted.toFixed(2)} onBlur={(newValue) => setSubCatProperty(newValue, subcategory.name, category.name, 'allotted')} />
                            </Grid>
                            <Grid item xs={2} ml={1.5}>
                                <Typography variant='body1'>${subcategory.currentSpent.toFixed(2)}</Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </div>
            }
        </Draggable>
    );
};

const Budget = (props) => {
    const { db } = useContext(FirebaseContext);
    const { profile } = useContext(UserContext);
    const { budget, setBudget, getBudget } = props;
    const theme = useTheme();

    const setMonthlyNetIncome = (newValue) => {
        setDoc(doc(db, 'budgets', profile.budgetId), { monthlyNetIncome: parseFloat(newValue) }, { merge: true }).then(() => getBudget());
    };
    
    const setCategoryName = (newValue, oldName) => {
        if (newValue === oldName) return;

        if (budget.categories.some(cat => cat.name === newValue)) {
            alert('This name is already in use!');
            getBudget(); // Have to do this to get EditableLabels to refresh their values
            return;
        }
        
        const updArr = [...budget.categories];
        updArr[updArr.findIndex(cat => cat.name === oldName)].name = newValue;
    
        setDoc(doc(db, 'budgets', profile.budgetId), { categories: updArr }, { merge: true }).then(() => getBudget());
    };
    
    const setSubCatProperty = (newValue, oldName, catName, propName) => {
        if (newValue === oldName) return;
        
        const updArr = [...budget.categories];
    
        updArr.forEach(cat => {
          if (cat.name === catName) {
            cat.subcategories.forEach(subCat => {
              if (subCat.name === oldName) {
                if (propName === 'name') {
                    if (cat.subcategories.some(scat => scat.name === subCat.name)) {
                        alert('This name is already in use!');
                        getBudget();
                        return;
                    }
                    subCat.name = newValue;
                }
                else if (propName === 'allotted') {
                    subCat.totalAllotted = parseFloat(newValue);
                } else {
                    console.error('Invalid property to set for subcat');
                }
              }
            });
          }
        });
        
        setDoc(doc(db, 'budgets', profile.budgetId), { categories: updArr }, { merge: true }).then(() => getBudget());
    };
    
    const addNewCategory = () => {
        let newCatName = 'New Category';
        let nameIterator = 1;

        while (budget.categories.some(cat => cat.name === newCatName)) {
            newCatName = `New Category${nameIterator}`;
            nameIterator++;
        };

        setDoc(doc(db, 'budgets', profile.budgetId), { categories: [...budget.categories, { name: newCatName, subcategories: [] }] }, { merge: true }).then(() => getBudget());
    };
    
    const removeCategory = (catName) => {
        const updArr = [...budget.categories];
    
        updArr.splice(updArr.findIndex((cat) => cat.name === catName), 1);
    
        setDoc(doc(db, 'budgets', profile.budgetId), { categories: updArr }, { merge: true }).then(() => getBudget()); 
    };
    
    const addNewSubCategory = (catName) => {
        const updArr = [...budget.categories];
    
        updArr.forEach(cat => {
          if (cat.name === catName) {
            let newSubCatName = 'New SubCategory';
            let nameIterator = 1;

            while (cat.subcategories.some(subcat => subcat.name === newSubCatName)) {
                newSubCatName = `New SubCategory${nameIterator}`;
                nameIterator++;
            };

            cat.subcategories.push({ name: newSubCatName, currentSpent: 0, totalAllotted: 0 });
          }
        });
    
        setDoc(doc(db, 'budgets', profile.budgetId), { categories: updArr }, { merge: true }).then(() => getBudget());
    };

    const removeSubCategory = (catName, subCatName) => {
        const updArr = [...budget.categories];
    
        updArr.forEach(cat => {
          if (cat.name === catName) {
            cat.subcategories.splice(cat.subcategories.findIndex((subcat) => subcat.name === subCatName), 1);
          }
        });
    
        setDoc(doc(db, 'budgets', profile.budgetId), { categories: updArr }, { merge: true }).then(() => getBudget());
    };

    const moveCategory = (dragIdx, dropIdx) => {
        const updArr = [...budget.categories];
        const cat = updArr[dragIdx];

        updArr.splice(dragIdx, 1);
        updArr.splice(dropIdx, 0, cat);

        const newBudget = { ...budget };
        newBudget.categories = updArr;
        setBudget(newBudget);
        setDoc(doc(db, 'budgets', profile.budgetId), { categories: updArr }, { merge: true }).then(() => getBudget());
    };

    const moveSubCategory = (srcCatName, destCatName, dragIdx, dropIdx) => {
        // Src & Dest cat is used to handle subcat being moved to a different cat=
        
        const updArr = [...budget.categories];
        const srcCatIdx = updArr.findIndex((cat) => cat.name === srcCatName);
        const destCatIdx = updArr.findIndex((cat) => cat.name === destCatName);
        const subcat = updArr[srcCatIdx].subcategories[dragIdx];

        updArr[srcCatIdx].subcategories.splice(dragIdx, 1);
        updArr[destCatIdx].subcategories.splice(dropIdx, 0, subcat);

        const newBudget = { ...budget };
        newBudget.categories = updArr;
        setBudget(newBudget);
        setDoc(doc(db, 'budgets', profile.budgetId), { categories: updArr }, { merge: true }).then(() => getBudget());
    };

    const setBudgetName = (newName) => {
        setDoc(doc(db, 'budgets', profile.budgetId), { name: newName }, { merge: true }).then(() => getBudget());
    };

    const getAllottedRemainder = () => {
        const difference = budget.monthlyNetIncome - budget.totalAllotted;
        let helperColor = '';
        let helperText = 'to allot';

        if (difference > 0) {
            helperColor = theme.palette.warning.main;
        }
        else if (difference === 0) {
            helperColor = null;
        } else {
            helperText = 'over-allotted';
            helperColor = theme.palette.error.main;
        }

        return (
            <Typography variant='subtitle1' ml={3} color={helperColor}>
                ${Math.abs(difference).toFixed(2)} {helperText}
            </Typography>
        );
    };

    const getSpendingRemainder = () => {
        const difference = budget.totalAllotted - budget.totalSpent;
        let helperColor = '';
        let helperText = 'remaining';

        if (difference > 0) {
            helperColor = theme.palette.success.main;
        }
        else if (difference === 0) {
            helperColor = null;
        } else {
            helperText = 'over-budget';
            helperColor = theme.palette.error.main;
        }

        return (
            <Typography variant='subtitle1' ml={3} color={helperColor}>
                ${Math.abs(difference).toFixed(2)} {helperText}
            </Typography>
        );
    };

    return (
        <Box key={budget.id} maxWidth='xl' mx='auto'>
            <Box textAlign='center' mb={4} mt={2} width={300} mx='auto'>
                <EditableLabel variant='h3' initialValue={budget.name} onBlur={setBudgetName} />
                <Typography variant='h5'>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Typography>
            </Box>

            <Box mb={4} width={325} mx='auto'>
                <Paper sx={{ p: 2 }}>
                    <Stack direction='row' alignContent='center' spacing={2} mb={2}>
                        <Typography variant='h6'>Net Income</Typography>
                        <EditableLabel variant='h5' prefix='$' initialValue={budget.monthlyNetIncome.toFixed(2)} onBlur={setMonthlyNetIncome} />
                    </Stack>

                    <Stack direction='row' alignContent='center' spacing={2}>
                        <Typography variant='h6'>Total Allotted</Typography>
                        <Typography variant='h5'>${budget.totalAllotted.toFixed(2)}</Typography>
                    </Stack>
                    {getAllottedRemainder()}

                    <Stack direction='row' alignContent='center' spacing={2} mt={1}>
                        <Typography variant='h6'>Total Spent</Typography>
                        <Typography variant='h5'>${budget.totalSpent.toFixed(2)}</Typography>
                    </Stack>
                    {getSpendingRemainder()}
                </Paper>
            </Box>

            <Box>
                <Paper sx={{ p: 1 }}>
                    <Grid container alignItems='center'>
                        <Grid item xs={6}>
                        <Stack direction='row' alignItems='center'>
                            <Tooltip title='Add category'><IconButton onClick={addNewCategory}><Add /></IconButton></Tooltip>
                        
                            <Stack>
                            <Typography variant='body1'>Category</Typography>
                            <Stack direction='row' alignItems='end'>
                                <SubdirectoryArrowRight />
                                <Typography variant='body2'>Sub-category</Typography>
                            </Stack>
                            </Stack>
                        </Stack>
                        </Grid>

                        <Grid item xs={3} ml={1}><Typography variant='body1'>Allotted</Typography></Grid>
                        <Grid item xs={2}><Typography variant='body1'>Spent</Typography></Grid>
                    </Grid>

                    <Divider />

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