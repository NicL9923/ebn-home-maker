import { MdKeyboardArrowDown } from 'react-icons/md';
import EditableLabel from 'components/Inputs/EditableLabel';
import { BudgetCategory, IBudget } from 'models/types';
import React, { useContext, useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { BudgetContext } from '../Budget';
import SubCategory from './SubCategory';
import { Box, Divider, Grid, GridItem, IconButton, Menu, MenuItem, Stack, Text } from '@chakra-ui/react';

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
  const [anchorEl, setAnchorEl] = useState<Element | undefined>(undefined);

  const isCategoryNameUnique = (newCatName: string) => {
    return !budget.categories.some((cat) => cat.name === newCatName);
  };

  return (
    <Draggable draggableId={category.name} index={idx}>
      {(provided) => (
        <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
          <Box mb={1}>
            <Grid alignItems='center'>
              <GridItem onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                <Stack direction='row' alignItems='center'>
                  <EditableLabel
                    fieldName='Category'
                    fieldType='ItemName'
                    textSize='xl'
                    text={category.name}
                    isValUnique={isCategoryNameUnique}
                    onSubmitValue={(newValue) => setCategoryName(newValue, category.name)}
                  />

                  <IconButton
                    icon={<MdKeyboardArrowDown />}
                    onClick={(event) => setAnchorEl(event.currentTarget)}
                    sx={{
                      display: isHovered ? 'inherit' : 'none',
                      p: 0,
                      ml: 1,
                    }}
                    aria-label='Category menu'
                  />
                  <Menu id={`cat${idx}-menu`} isOpen={!!anchorEl} onClose={() => setAnchorEl(undefined)}>
                    <MenuItem onClick={() => addNewSubCategory(category.name)}>Add sub-category</MenuItem>
                    <MenuItem onClick={() => removeCategory(category.name)}>Delete category</MenuItem>
                  </Menu>
                </Stack>
              </GridItem>
              <GridItem>
                <Text ml={1} sx={{ fontWeight: 'bold' }}>
                  $
                  {category.totalAllotted?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </GridItem>
              <GridItem>
                <Text ml={1} sx={{ fontWeight: 'bold' }}>
                  $
                  {category.currentSpent?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </GridItem>
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
