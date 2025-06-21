import { Box } from '@chakra-ui/react';
import { useContext } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { BudgetContext } from '../Budget';
import Category from './Category';

export const subcatPrefix = 'subcats-';

const BudgetCategories = () => {
    const { budget, moveCategory, moveSubCategory } = useContext(BudgetContext);

    const onDragEnd = ({ type, source, destination }: DropResult) => {
        if (!source || !destination || !type) return;

        if (type === 'category') {
            moveCategory(source.index, destination.index);
        } else if (type === 'subcategory') {
            const srcCat = source.droppableId.replace(subcatPrefix, '');
            const destCat = destination.droppableId.replace(subcatPrefix, '');

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
                                    key={category.uid}
                                    idx={idx}
                                    category={category}
                                    budget={budget}
                                    isLastCat={idx === budget.categories.length - 1}
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
