import { MdKeyboardArrowDown } from 'react-icons/md';
import EditableLabel from 'components/Inputs/EditableLabel';
import { BudgetCategory, IBudget } from 'models/types';
import React, { useContext } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { BudgetContext, budgetRowsGridTemplateColumns } from '../Budget';
import SubCategory from './SubCategory';
import {
  Box,
  Divider,
  Grid,
  GridItem,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from '@chakra-ui/react';
import { subcatPrefix } from './BudgetCategories';

interface CategoryProps {
  idx: number;
  category: BudgetCategory;
  isLastCat: boolean;
  budget: IBudget;
}

const Category = (props: CategoryProps) => {
  const { budget, setCategoryName, removeCategory, addNewSubCategory } = useContext(BudgetContext);
  const { idx, category, isLastCat } = props;

  const isCategoryNameUnique = (newCatName: string) => {
    return !budget.categories.some((cat) => cat.name === newCatName);
  };

  return (
    <Draggable draggableId={category.uid} index={idx}>
      {(provided) => (
        <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
          <Box mb={1}>
            <Grid templateColumns={budgetRowsGridTemplateColumns} alignItems='center' gridColumnGap={1}>
              <GridItem>
                <Stack direction='row' alignItems='center' w='100%'>
                  <EditableLabel
                    fieldName='Category'
                    fieldType='ItemName'
                    textSize='xl'
                    text={category.name}
                    isValUnique={isCategoryNameUnique}
                    onSubmitValue={(newValue) => setCategoryName(newValue, category.name)}
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
                      <MenuItem onClick={() => addNewSubCategory(category.name)}>Add sub-category</MenuItem>
                      <MenuItem onClick={() => removeCategory(category.name)}>Delete category</MenuItem>
                    </MenuList>
                  </Menu>
                </Stack>
              </GridItem>

              <GridItem w='100%'>
                <Text ml={1} sx={{ fontWeight: 'bold' }}>
                  $
                  {category.totalAllotted?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </GridItem>

              <GridItem w='100%'>
                <Text ml={1} sx={{ fontWeight: 'bold' }}>
                  $
                  {category.currentSpent?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </GridItem>
            </Grid>

            <Droppable droppableId={`${subcatPrefix}${category.name}`} type='subcategory'>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {category.subcategories.map((subcategory, subidx) => (
                    <SubCategory key={subcategory.uid} subidx={subidx} category={category} subcategory={subcategory} />
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
