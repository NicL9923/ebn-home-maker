import React, { useMemo, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import SingleFieldDialog from '../src/components/Inputs/SingleFieldDialog';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { useUserStore } from '../src/state/UserStore';
import { db, FsCol } from '../src/firebase';
import { Box, Button, Checkbox, Heading, List, ListItem, Stack, useColorModeValue, useToast } from '@chakra-ui/react';
import { MdAdd, MdDelete } from 'react-icons/md';
import { GroceryItem } from '../src/models/types';
import { genUuid } from '../src/utils/utils';

const GroceryList = () => {
  const toast = useToast();
  const listBgColor = useColorModeValue('gray.50', 'gray.700');
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const [isEditing, setIsEditing] = useState(false);

  if (!profile || !family) {
    return null;
  }

  const addGroceryItem = (newItemName?: string) => {
    if (!newItemName) return;

    const newList: GroceryItem[] = [...family.groceryList, { uid: genUuid(), name: newItemName, isBought: false }];

    updateDoc(doc(db, FsCol.Families, profile.familyId), { groceryList: newList }).then(() => {
      toast({
        title: 'Successfully added item!',
        status: 'success',
        isClosable: true,
      });
    });
  };

  const editGroceryItem = (idx: number, newName: string | undefined, isBought: boolean) => {
    const updGroceryList = [...family.groceryList];

    if (newName) {
      updGroceryList[idx].name = newName;
    }

    updGroceryList[idx].isBought = isBought;

    updateDoc(doc(db, FsCol.Families, profile.familyId), { groceryList: updGroceryList });
  };

  const removeGroceryItems = () => {
    if (!window.confirm('Are you sure you want to remove all checked items?')) {
      return;
    }

    const updGroceryList = family.groceryList.filter((val) => val.isBought === false);

    updateDoc(doc(db, FsCol.Families, profile.familyId), { groceryList: updGroceryList });
  };

  const onDragEnd = ({ type, source, destination }: DropResult) => {
    if (!source || !destination || !type) return;

    if (type === 'gListItem') {
      const newGList = [...family.groceryList];
      const listItem = newGList[source.index];

      newGList.splice(source.index, 1);
      newGList.splice(destination.index, 0, listItem);

      updateDoc(doc(db, FsCol.Families, profile.familyId), { groceryList: newGList });
    }
  };

  const isItemSelected = useMemo(
    () => family.groceryList.length > 0 && family.groceryList.some((item) => item.isBought),
    [family.groceryList]
  );

  return (
    <Box mt={2} p={2}>
      <Heading mb={2}>Grocery List</Heading>

      <Stack direction='row'>
        <Button size='sm' leftIcon={<MdAdd />} onClick={() => setIsEditing(true)}>
          Add item
        </Button>

        <Button
          size='sm'
          leftIcon={<MdDelete />}
          onClick={removeGroceryItems}
          mt='8'
          colorScheme='red'
          disabled={!isItemSelected}
        >
          Remove checked items
        </Button>
      </Stack>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId='groceryList' type='gListItem'>
          {(provided) => (
            <List
              {...provided.droppableProps}
              ref={provided.innerRef}
              mt='2'
              height='75vh'
              width='85vw'
              overflow='auto'
              bgColor={listBgColor}
              p='3'
              borderRadius='md'
            >
              {family.groceryList.map((groceryItem, idx) => (
                <Draggable draggableId={`${groceryItem.uid}`} index={idx} key={`${groceryItem.uid}`}>
                  {(provided) => (
                    <ListItem {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                      <Checkbox
                        size='lg'
                        colorScheme='green'
                        checked={groceryItem.isBought}
                        onChange={(e) => editGroceryItem(idx, undefined, e.target.checked)}
                        m='2'
                      >
                        {groceryItem.name}
                      </Checkbox>
                    </ListItem>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>

      <SingleFieldDialog
        initialValue={''}
        titleVerb={'Add'}
        fieldName={'Grocery item'}
        fieldType={'EntityName'}
        isOpen={isEditing}
        onClosed={() => setIsEditing(false)}
        onSubmitValue={addGroceryItem}
      />
    </Box>
  );
};

export default GroceryList;
