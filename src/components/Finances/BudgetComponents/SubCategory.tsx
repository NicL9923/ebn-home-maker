import React, { useContext } from 'react';
import { BudgetCategory, BudgetSubcategory } from 'models/types';
import { BudgetContext, budgetRowsGridTemplateColumns } from '../Budget';
import { Draggable } from 'react-beautiful-dnd';
import EditableLabel from 'components/Inputs/EditableLabel';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { catSubcatKeySeparator } from 'components/Forms/AddTransaction';
import {
  Box,
  Grid,
  GridItem,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Progress,
  Stack,
  Text,
} from '@chakra-ui/react';

interface SubCategoryProps {
  subidx: number;
  category: BudgetCategory;
  subcategory: BudgetSubcategory;
}

const SubCategory = (props: SubCategoryProps) => {
  const { setSubCatProperty, setCatSubcatKey, setAddingTransaction, removeSubCategory } = useContext(BudgetContext);
  const { subidx, category, subcategory } = props;

  const isSubcategoryNameUnique = (category: BudgetCategory, newSubcatName: string) => {
    return !category.subcategories.some((subcat) => subcat.name === newSubcatName);
  };

  const getLinearProgressValue = (curSpent: number, curAllotted: number) =>
    Math.max(0, Math.min(1, curSpent / curAllotted)) * 100;

  const getLinearProgressColor = (curSpent: number, curAllotted: number) => {
    if (Math.round((curSpent / curAllotted) * 100) > 100) {
      return 'red';
    } else {
      return 'green';
    }
  };

  return (
    <Draggable draggableId={subcategory.name} index={subidx}>
      {(provided) => (
        <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
          <Box ml={2} mb={1}>
            <Grid templateColumns={budgetRowsGridTemplateColumns} gridColumnGap={1} alignItems='center'>
              <GridItem>
                <Stack direction='row' alignItems='center' textAlign='left'>
                  <EditableLabel
                    fieldName='Subcategory'
                    fieldType='ItemName'
                    isValUnique={(valToCheck) => isSubcategoryNameUnique(category, valToCheck)}
                    text={subcategory.name}
                    onSubmitValue={(newValue) => setSubCatProperty(newValue, subcategory.name, category.name, 'name')}
                  />

                  <Menu>
                    <MenuButton>
                      <IconButton
                        icon={<MdKeyboardArrowDown />}
                        fontSize={24}
                        variant='ghost'
                        aria-label='Category menu'
                      />
                    </MenuButton>

                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          setCatSubcatKey(`${category.name}${catSubcatKeySeparator}${subcategory.name}`);
                          setAddingTransaction(true);
                        }}
                      >
                        Add transaction
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          removeSubCategory(category.name, subcategory.name);
                        }}
                      >
                        Delete subcategory
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Stack>

                <Progress
                  textAlign='start'
                  value={getLinearProgressValue(subcategory.currentSpent, subcategory.totalAllotted)}
                  colorScheme={getLinearProgressColor(subcategory.currentSpent, subcategory.totalAllotted)}
                  mt={1}
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
