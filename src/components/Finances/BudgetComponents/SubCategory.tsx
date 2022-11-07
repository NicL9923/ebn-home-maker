import React, { useContext, useState } from 'react';
import { BudgetCategory, BudgetSubcategory } from 'models/types';
import { BudgetContext } from '../Budget';
import { Draggable } from 'react-beautiful-dnd';
import EditableLabel from 'components/Inputs/EditableLabel';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { catSubcatKeySeparator } from 'components/Forms/AddTransaction';
import { Box, Grid, GridItem, IconButton, Menu, MenuItem, Progress, Stack, Text } from '@chakra-ui/react';

interface SubCategoryProps {
  subidx: number;
  category: BudgetCategory;
  subcategory: BudgetSubcategory;
}

const SubCategory = (props: SubCategoryProps): JSX.Element => {
  const { setSubCatProperty, setCatSubcatKey, setAddingTransaction, removeSubCategory } = useContext(BudgetContext);
  const { subidx, category, subcategory } = props;
  const [isHovered, setIsHovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState<Element | undefined>(undefined);

  // TODO: handle identically named subcat being moved to the same cat as its twin
  const isSubcategoryNameUnique = (category: BudgetCategory, newSubcatName: string) => {
    return !category.subcategories.some((subcat) => subcat.name === newSubcatName);
  };

  const getLinearProgressValue = (curSpent: number, curAllotted: number) =>
    Math.max(0, Math.min(1, curSpent / curAllotted)) * 100;

  const getLinearProgressColor = (curSpent: number, curAllotted: number) => {
    if (Math.round((curSpent / curAllotted) * 100) > 100) {
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
            <Grid alignItems='center'>
              <GridItem onMouseOver={() => setIsHovered(true)} onMouseOut={() => setIsHovered(false)}>
                <Stack direction='row' alignItems='center'>
                  <EditableLabel
                    fieldName='Subcategory'
                    fieldType='ItemName'
                    isValUnique={(valToCheck) => isSubcategoryNameUnique(category, valToCheck)}
                    text={subcategory.name}
                    onSubmitValue={(newValue) => setSubCatProperty(newValue, subcategory.name, category.name, 'name')}
                  />

                  <IconButton
                    icon={<MdKeyboardArrowDown />}
                    onClick={(event) => setAnchorEl(event.currentTarget)}
                    sx={{
                      display: isHovered ? 'inherit' : 'hidden',
                      p: 0,
                      ml: 1,
                    }}
                    aria-label='Subcategory menu'
                  />
                  <Menu id={`subcat${subidx}-menu`} isOpen={!!anchorEl} onClose={() => setAnchorEl(undefined)}>
                    <MenuItem
                      onClick={() => {
                        setCatSubcatKey(`${category.name}${catSubcatKeySeparator}${subcategory.name}`);
                        setAddingTransaction(true);
                        setAnchorEl(undefined);
                      }}
                    >
                      Add transaction
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        removeSubCategory(category.name, subcategory.name);
                        setAnchorEl(undefined);
                      }}
                    >
                      Delete subcategory
                    </MenuItem>
                  </Menu>
                </Stack>

                <Progress
                  value={getLinearProgressValue(subcategory.currentSpent, subcategory.totalAllotted)}
                  color={getLinearProgressColor(subcategory.currentSpent, subcategory.totalAllotted)}
                  sx={{ width: '85%', mt: 1 }}
                />
              </GridItem>

              <GridItem>
                <EditableLabel
                  fieldName='Total allotted'
                  fieldType='DecimalNum'
                  isMonetaryValue
                  text={subcategory.totalAllotted.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  onSubmitValue={(newValue) => setSubCatProperty(newValue, subcategory.name, category.name, 'allotted')}
                />
              </GridItem>
              <GridItem>
                <Text>
                  $
                  {subcategory.currentSpent.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </GridItem>
            </Grid>
          </Box>
        </div>
      )}
    </Draggable>
  );
};

export default SubCategory;
