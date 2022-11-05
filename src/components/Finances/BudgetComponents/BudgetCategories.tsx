import { Box } from '@chakra-ui/react';
import React, { useContext } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { Droppable, DropResult } from 'react-beautiful-dnd';
import { BudgetContext } from '../Budget';
import Category from './Category';

const BudgetCategories = () => {
  const { budget, moveCategory, moveSubCategory } = useContext(BudgetContext);

  const onDragEnd = ({ type, source, destination }: DropResult) => {
    if (!source || !destination || !type) return;

    if (type === 'category') {
      moveCategory(source.index, destination.index);
    } else if (type === 'subcategory') {
      const srcCat = source.droppableId.replace('subcats-', '');
      const destCat = destination.droppableId.replace('subcats-', '');

      moveSubCategory(srcCat, destCat, source.index, destination.index);
    }
  };

  return (
    <Box pt={1} pb={1}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId='budgetCats' type='category'>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {budget.categories.map((category, idx) => (
                <Category
                  key={category.name}
                  idx={idx}
                  category={category}
                  budget={budget}
                  isLastCat={idx === budget.categories.length - 1 ? true : false}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
};

export default BudgetCategories;
