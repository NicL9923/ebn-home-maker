import React, { useContext, useState } from 'react';
import { BudgetCategory, BudgetSubcategory } from 'models/types';
import { BudgetContext } from '../Budget';
import { Box, Grid, IconButton, LinearProgress, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { Draggable } from 'react-beautiful-dnd';
import EditableLabel from 'components/Inputs/EditableLabel';
import { KeyboardArrowDown } from '@mui/icons-material';
import { catSubcatKeySeparator } from 'components/Forms/AddTransaction';

interface SubCategoryProps {
  subidx: number;
  category: BudgetCategory;
  subcategory: BudgetSubcategory;
}

const SubCategory = (props: SubCategoryProps): JSX.Element => {
  const { setSubCatProperty, setCatSubcatKey, setAddingTransaction, removeSubCategory } = useContext(BudgetContext);
  const { subidx, category, subcategory } = props;
  const [isHovered, setIsHovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  // TODO: handle identically named subcat being moved to the same cat as its twin
  const isSubcategoryNameUnique = (category: BudgetCategory, newSubcatName: string) => {
    return !category.subcategories.some((subcat) => subcat.name === newSubcatName);
  };

  const getLinearProgressValue = (curSpent: number, curAllotted: number) =>
    Math.max(0, Math.min(1, curSpent / curAllotted)) * 100;

  const getLinearProgressColor = (curSpent: number, curAllotted: number) => {
    if (curSpent / curAllotted > 1) {
      return 'error';
    } else {
      return 'primary';
    }
  };

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
                    onClick={(event) => setAnchorEl(event.currentTarget)}
                    sx={{
                      display: isHovered ? 'inherit' : 'hidden',
                      p: 0,
                      ml: 1,
                    }}
                  >
                    <KeyboardArrowDown sx={{ fontSize: 30 }} />
                  </IconButton>
                  <Menu
                    id={`subcat${subidx}-menu`}
                    anchorEl={anchorEl}
                    open={!!anchorEl}
                    onClose={() => setAnchorEl(null)}
                  >
                    <MenuItem
                      onClick={() => {
                        setCatSubcatKey(`${category.name}${catSubcatKeySeparator}${subcategory.name}`);
                        setAddingTransaction(true);
                      }}
                    >
                      Add transaction
                    </MenuItem>
                    <MenuItem onClick={() => removeSubCategory(category.name, subcategory.name)}>
                      Delete subcategory
                    </MenuItem>
                  </Menu>
                </Stack>
                <LinearProgress
                  value={getLinearProgressValue(subcategory.currentSpent, subcategory.totalAllotted)}
                  color={getLinearProgressColor(subcategory.currentSpent, subcategory.totalAllotted)}
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

export default SubCategory;
