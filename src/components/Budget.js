import { Add, Clear, SubdirectoryArrowRight } from '@mui/icons-material';
import { Box, Container, Divider, Grid, IconButton, LinearProgress, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { doc, setDoc } from 'firebase/firestore';
import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Draggable } from 'react-beautiful-dnd';
import { DragDropContext } from 'react-beautiful-dnd';
import EditableLabel from './EditableLabel';


// TODO: handle (i.e. prevent) duplicate category names
// TODO: calculate currentSpents from transactions

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
                            {budget.categories.map((category, idx) => 
                                <Category
                                    key={category.name}
                                    idx={idx}
                                    category={category}
                                    setCategoryName={setCategoryName}
                                    addNewSubCategory={addNewSubCategory}
                                    removeCategory={removeCategory}
                                    setSubCatProperty={setSubCatProperty}
                                    removeSubCategory={removeSubCategory}
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
    const { idx, category, setCategoryName, addNewSubCategory, removeCategory, setSubCatProperty, removeSubCategory } = props;

    return (
        <Draggable draggableId={category.name} index={idx}>
            {(provided) =>
                <div { ...provided.draggableProps } { ...provided.dragHandleProps } ref={provided.innerRef}>
                <Stack mb={1}>
                    <Grid container alignItems='center'>
                    <Grid item xs={6}>
                        <Stack direction='row' alignItems='center'>
                        <EditableLabel variant='h5' initialValue={category.name} onBlur={(newValue) => setCategoryName(newValue, category.name)} />
                        <Tooltip title='Add sub-category'><IconButton onClick={() => addNewSubCategory(category.name)}><Add /></IconButton></Tooltip>
                        <Tooltip title='Delete category'><IconButton onClick={() => removeCategory(category.name)}><Clear /></IconButton></Tooltip>
                        </Stack>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography variant='body1' ml={1} sx={{ fontWeight: 'bold' }}>${category.totalAllotted.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={2}>
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
                    <Divider />
                </Stack>
                </div>
            }
        </Draggable>
    );
};

const SubCategory = (props) => {
    const { subidx, category, subcategory, setSubCatProperty, removeSubCategory } = props;

    return (
        <Draggable draggableId={subcategory.name} index={subidx}>
            {(provided) =>
                <div { ...provided.draggableProps } { ...provided.dragHandleProps } ref={provided.innerRef}>
                <Stack ml={4} mb={1}>
                    <Grid container alignItems='center'>
                    <Grid item xs={6}>
                        <Stack direction='row' alignItems='center'>
                        <EditableLabel initialValue={subcategory.name} onBlur={(newValue) => setSubCatProperty(newValue, subcategory.name, category.name, 'name')} />
                        <Tooltip title='Delete sub-category'><IconButton onClick={() => removeSubCategory(category.name, subcategory.name)}><Clear /></IconButton></Tooltip>
                        </Stack>
                        <LinearProgress value={(subcategory.currentSpent / subcategory.totalAllotted) * 100} variant='determinate' sx={{ width: '85%' }} />
                    </Grid>

                    <Grid item xs={2} ml={-1}>
                        <EditableLabel variant='body1' prefix='$' initialValue={`${subcategory.totalAllotted.toFixed(2)}`} onBlur={(newValue) => setSubCatProperty(newValue, subcategory.name, category.name, 'allotted')} />
                    </Grid>
                    <Grid item xs={2} ml={1}>
                        <Typography variant='body1'>${subcategory.currentSpent.toFixed(2)}</Typography>
                    </Grid>
                    </Grid>
                </Stack>
                </div>
            }
        </Draggable>
    );
};

const Budget = (props) => {
    const { budget, setBudget, getBudget, profile, db } = props;

    const setMonthlyNetIncome = (newValue) => {
        setDoc(doc(db, 'budgets', profile.budget), { monthlyNetIncome: parseFloat(newValue) }, { merge: true }).then(() => getBudget());
    };
    
    const setCategoryName = (newValue, oldName) => {
        if (newValue === oldName) return;
        
        const updArr = [...budget.categories];
    
        // TODO: Do this a better way (using proper JS array methods probably)
        updArr.forEach(cat => {
          if (cat.name === oldName) {
            cat.name = newValue;
          }
        });
    
        setDoc(doc(db, 'budgets', profile.budget), { categories: updArr }, { merge: true }).then(() => getBudget());
    };
    
    const setSubCatProperty = (newValue, oldName, catName, propName) => {
        if (newValue === oldName) return;
        
        const updArr = [...budget.categories];
    
        updArr.forEach(cat => {
          if (cat.name === catName) {
            cat.subcategories.forEach(subCat => {
              if (subCat.name === oldName) {
                if (propName === 'name') {
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
        
        setDoc(doc(db, 'budgets', profile.budget), { categories: updArr }, { merge: true }).then(() => getBudget());
    };
    
    const addNewCategory = () => {
        setDoc(doc(db, 'budgets', profile.budget), { categories: [...budget.categories, { name: 'New Category', subcategories: [] }] }, { merge: true }).then(() => getBudget());
    };
    
    const removeCategory = (catName) => {
        const updArr = [...budget.categories];
    
        updArr.splice(updArr.findIndex((cat) => cat.name === catName), 1);
    
        setDoc(doc(db, 'budgets', profile.budget), { categories: updArr }, { merge: true }).then(() => getBudget()); 
    };
    
    const addNewSubCategory = (catName) => {
        const updArr = [...budget.categories];
    
        updArr.forEach(cat => {
          if (cat.name === catName) {
            cat.subcategories.push({ name: 'New SubCategory', currentSpent: 0, totalAllotted: 0 });
          }
        });
    
        setDoc(doc(db, 'budgets', profile.budget), { categories: updArr }, { merge: true }).then(() => getBudget());
    };

    const removeSubCategory = (catName, subCatName) => {
        const updArr = [...budget.categories];
    
        updArr.forEach(cat => {
          if (cat.name === catName) {
            cat.subcategories.splice(cat.subcategories.findIndex((subcat) => subcat.name === subCatName), 1);
          }
        });
    
        setDoc(doc(db, 'budgets', profile.budget), { categories: updArr }, { merge: true }).then(() => getBudget());
    };

    const moveCategory = (dragIdx, dropIdx) => {
        const updArr = [...budget.categories];
        const cat = updArr[dragIdx];

        updArr.splice(dragIdx, 1);
        updArr.splice(dropIdx, 0, cat);

        const newBudget = { ...budget };
        newBudget.categories = updArr;
        setBudget(newBudget);
        setDoc(doc(db, 'budgets', profile.budget), { categories: updArr }, { merge: true }).then(() => getBudget());
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
        setDoc(doc(db, 'budgets', profile.budget), { categories: updArr }, { merge: true }).then(() => getBudget());
    };

    return (<>
        <Typography variant='h3' mb={4} mt={2}>Budget - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Typography>
        <Stack key={budget.id}>
            <Grid container mb={4}>
                <Grid item xs={4}>
                    <Paper component={Container} sx={{ height: 150, width: 250 }}>
                    <Typography variant='h6'>Net Income</Typography>
                    <EditableLabel variant='h4' prefix='$' initialValue={budget.monthlyNetIncome.toFixed(2)} onBlur={setMonthlyNetIncome} />
                    </Paper>
                </Grid>

                <Grid item xs={4}>
                    <Paper component={Container} sx={{ height: 150, width: 250 }}>
                    <Typography variant='h6'>Total Allotted</Typography>
                    <Typography variant='h4'>${budget.totalAllotted.toFixed(2)}</Typography>
                    <Typography variant='h6'>${Math.abs(budget.monthlyNetIncome - budget.totalAllotted).toFixed(2)} {(budget.monthlyNetIncome - budget.totalAllotted) >= 0 ? 'to allot' : 'over-allotted'}</Typography>
                    </Paper>
                </Grid>
                
                <Grid item xs={4}>
                    <Paper component={Container} sx={{ height: 150, width: 250 }}>
                    <Typography variant='h6'>Total Spent</Typography>
                    <Typography variant='h4'>${budget.totalSpent.toFixed(2)}</Typography>
                    <Typography variant='h6'>${Math.abs(budget.totalAllotted - budget.totalSpent).toFixed(2)} {(budget.totalAllotted - budget.totalSpent) >= 0 ? 'remaining' : 'over-budget'}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Paper>
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

                    <Grid item xs={2}><Typography variant='body1'>Allotted</Typography></Grid>
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
        </Stack>
    </>);
};

export default Budget;