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
import { useContext } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { BudgetCategory, BudgetSubcategory } from '../../../models/types';
import { calcMonetaryValuesRatioAsPercentInt, compareMonetaryValues, getCurrencyString } from '../../../utils/utils';
import { catSubcatKeySeparator } from '../../Forms/AddOrEditTransaction';
import EditableLabel from '../../Inputs/EditableLabel';
import { BudgetContext, budgetRowsGridTemplateColumns } from '../Budget';

interface SubCategoryProps {
  subidx: number;
  category: BudgetCategory;
  subcategory: BudgetSubcategory;
}

const SubCategory = (props: SubCategoryProps) => {
  const { setSubCatProperty, setCatSubcatKey, setAddingTransaction, setItemToRemove } = useContext(BudgetContext);
  const { subidx, category, subcategory } = props;

  const isSubcategoryNameUnique = (category: BudgetCategory, newSubcatName: string) => {
    return !category.subcategories.some((subcat) => subcat.name === newSubcatName);
  };

  const getLinearProgressValue = (curSpent: number, curAllotted: number) =>
    calcMonetaryValuesRatioAsPercentInt(curSpent, curAllotted);

  const getLinearProgressColor = (curSpent: number, curAllotted: number) => {
    const comparisonResult = compareMonetaryValues(curSpent, curAllotted);

    if (comparisonResult === 'over') {
      return 'red';
    }

    return 'green';
  };

  return (
    <Draggable draggableId={subcategory.uid} index={subidx}>
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
                        variant='ghost'
                        fontSize={24}
                        size='sm'
                        aria-label='Subcategory menu'
                        ml={-1}
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
                      <MenuItem onClick={() => setItemToRemove([category.name, subcategory.name])}>
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
                  text={getCurrencyString(subcategory.totalAllotted, false)}
                  onSubmitValue={(newValue) => setSubCatProperty(newValue, subcategory.name, category.name, 'allotted')}
                />
              </GridItem>
              <GridItem>
                <Text>
                  {getCurrencyString(subcategory.currentSpent)}
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
