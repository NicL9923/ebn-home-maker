import { KeyboardArrowDown } from '@mui/icons-material';
import { Box, Divider, Grid, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import EditableLabel from 'components/Inputs/EditableLabel';
import { BudgetCategory, IBudget } from 'models/types';
import React, { useContext, useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { BudgetContext } from '../Budget';
import SubCategory from './SubCategory';

interface CategoryProps {
  idx: number;
  category: BudgetCategory;
  isLastCat: boolean;
  budget: IBudget;
}

const Category = (props: CategoryProps): JSX.Element => {
  const { budget, setCategoryName, removeCategory, addNewSubCategory } = useContext(BudgetContext);
  const { idx, category, isLastCat } = props;
  const [isHovered, setIsHovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const isCategoryNameUnique = (newCatName: string) => {
    return !budget.categories.some((cat) => cat.name === newCatName);
  };

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
                    <SubCategory key={subcategory.name} subidx={subidx} category={category} subcategory={subcategory} />
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

export default Category;
