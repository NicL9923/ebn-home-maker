import { Add, Clear, SubdirectoryArrowRight } from '@mui/icons-material';
import { Box, Container, Divider, Grid, IconButton, LinearProgress, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { doc, setDoc } from 'firebase/firestore';
import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import EditableLabel from './EditableLabel';


// TODO: handle duplicate category names

const BudgetCategories = (props) => {
    const { budget, setCategoryName, addNewSubCategory, removeCategory, setSubCatProperty, removeSubCategory } = props;
    const [{ isOver }, dropRef] = useDrop({
        accept: 'category',
        drop: (item) => {{}},
        collect: (monitor) => ({
            isOver: monitor.isOver()
        })
    });

    return (
        <Box p={2} ref={dropRef}>
            {budget.categories.map(category => 
                <Category
                    key={category.name}
                    category={category}
                    setCategoryName={setCategoryName}
                    addNewSubCategory={addNewSubCategory}
                    removeCategory={removeCategory}
                    setSubCatProperty={setSubCatProperty}
                    removeSubCategory={removeSubCategory}
                />
            )}
        </Box>
    );
};

const Category = (props) => {
    const { category, setCategoryName, addNewSubCategory, removeCategory, setSubCatProperty, removeSubCategory } = props;
    const [{ isDragging }, dragRef] = useDrag({
        type: 'category',
        item: category.name,
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    });
    const [{ isOver }, dropRef] = useDrop({
        accept: 'subcategory',
        drop: (item) => {{}},
        collect: (monitor) => ({
            isOver: monitor.isOver()
        })
    });

    return (
        <Stack mb={1} ref={dragRef}>
            <Grid container alignItems='center'>
            <Grid item xs={8}>
                <Stack direction='row' alignItems='center'>
                <EditableLabel variant='h5' initialValue={category.name} onBlur={(newValue) => setCategoryName(newValue, category.name)} />
                <Tooltip title='Add sub-category'><IconButton onClick={() => addNewSubCategory(category.name)}><Add /></IconButton></Tooltip>
                <Tooltip title='Delete category'><IconButton onClick={() => removeCategory(category.name)}><Clear /></IconButton></Tooltip>
                </Stack>
            </Grid>
            <Grid item xs={2}>
                <Typography variant='body1'>${category.totalAllotted.toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={2}>
                <Typography variant='body1'>${category.currentSpent.toFixed(2)}</Typography>
            </Grid>
            </Grid>

            <Stack ref={dropRef}>
                {category.subcategories.map(subcategory =>
                    <SubCategory
                        key={subcategory.name}
                        category={category}
                        subcategory={subcategory}
                        setSubCatProperty={setSubCatProperty}
                        removeSubCategory={removeSubCategory}
                    />
                )}
            </Stack>
        </Stack>
    );
};

const SubCategory = (props) => {
    const { category, subcategory, setSubCatProperty, removeSubCategory } = props;
    const [{ isDragging }, dragRef] = useDrag({
        type: 'subcategory',
        item: subcategory.name,
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    });

    return (
        <Stack ml={6} ref={dragRef}>
            <Grid container alignItems='center'>
            <Grid item xs={8}>
                <Stack direction='row' alignItems='center'>
                <EditableLabel initialValue={subcategory.name} onBlur={(newValue) => setSubCatProperty(newValue, subcategory.name, category.name, 'name')} />
                <Tooltip title='Delete sub-category'><IconButton onClick={() => removeSubCategory(category.name, subcategory.name)}><Clear /></IconButton></Tooltip>
                </Stack>
                <LinearProgress value={(subcategory.currentSpent / subcategory.totalAllotted) * 100} variant='determinate' sx={{ width: '85%' }} />
            </Grid>

            <Grid item xs={2}>
                <EditableLabel variant='body1' prefix='$' initialValue={`${subcategory.totalAllotted.toFixed(2)}`} onBlur={(newValue) => setSubCatProperty(newValue, subcategory.name, category.name, 'allotted')} />
            </Grid>
            <Grid item xs={2}>
                <Typography variant='body1'>${subcategory.currentSpent.toFixed(2)}</Typography>
            </Grid>
            </Grid>
        </Stack>
    );
};

const Budget = (props) => {
    const { budget, getBudget, profile, db } = props;

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
                    <Grid item xs={8}>
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
                />
            </Paper>
        </Stack>
    </>);
};

export default Budget;