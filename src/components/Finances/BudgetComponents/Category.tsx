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
import { useContext } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { BudgetCategory, IBudget } from '../../../models/types';
import EditableLabel from '../../Inputs/EditableLabel';
import { BudgetContext, budgetRowsGridTemplateColumns } from '../Budget';
import { subcatPrefix } from './BudgetCategories';
import SubCategory from './SubCategory';

interface CategoryProps {
  idx: number;
  category: BudgetCategory;
  isLastCat: boolean;
  budget: IBudget;
}

const Category = (props: CategoryProps) => {
  const { budget, setCategoryName, setItemToRemove, addNewSubCategory } = useContext(BudgetContext);
  const { idx, category, isLastCat } = props;

  const isCategoryNameUnique = (newCatName: string) => {
    return !budget.categories.some((cat) => cat.name === newCatName);
  };

  return (
    <Draggable draggableId={category.uid} index={idx}>
      {(provided) => (
        <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
          <Box mb={2}>
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
                        variant='ghost'
                        fontSize={24}
                        size='sm'
                        aria-label='Category menu'
                        ml={-1}
                      />
                    </MenuButton>

                    <MenuList>
                      <MenuItem onClick={() => addNewSubCategory(category.name)}>Add sub-category</MenuItem>
                      <MenuItem onClick={() => setItemToRemove([category.name, undefined])}>Delete category</MenuItem>
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

            {!isLastCat && <Divider mt={4} />}
          </Box>
        </div>
      )}
    </Draggable>
  );
};

export default Category;
