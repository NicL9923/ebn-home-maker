import { useMemo, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import SingleFieldDialog from '../components/Inputs/SingleFieldDialog';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { useUserStore } from '../state/UserStore';
import { db, FsCol } from '../firebase';
import { Box, Button, Checkbox, Heading, List, ListItem, Stack, useColorModeValue, useToast } from '@chakra-ui/react';
import { MdAdd, MdDelete, MdEdit } from 'react-icons/md';
import { GroceryItem } from '../models/types';
import { genUuid } from '../utils/utils';

const GroceryList = () => {
  const toast = useToast();
  const listBgColor = useColorModeValue('gray.50', 'gray.700');
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const [isAdding, setIsAdding] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<GroceryItem>();

  const addOrEditGroceryItem = (newItemName?: string) => {
    if (!newItemName || !family || !profile) return;

    const newList = [...family.groceryList];

    if (itemToEdit) {
      const idx = newList.findIndex((item) => item.uid === itemToEdit.uid);
      newList[idx].name = newItemName;
    } else {
      newList.push({ uid: genUuid(), name: newItemName, isBought: false });
    }

    updateDoc(doc(db, FsCol.Families, profile.familyId), { groceryList: newList }).then(() => {
      toast({
        title: 'Successfully added item!',
        status: 'success',
        isClosable: true,
      });
    });
  };

  const editGroceryItem = (idx: number, newName: string | undefined, isBought: boolean) => {
    if (!family || !profile) return;

    const updGroceryList = [...family.groceryList];

    if (newName) {
      updGroceryList[idx].name = newName;
    }

    updGroceryList[idx].isBought = isBought;

    updateDoc(doc(db, FsCol.Families, profile.familyId), { groceryList: updGroceryList });
  };

  const removeGroceryItems = () => {
    if (!family || !profile) return;
    if (!window.confirm('Are you sure you want to remove all checked items?')) {
      return;
    }

    const updGroceryList = family.groceryList.filter((val) => val.isBought === false);

    updateDoc(doc(db, FsCol.Families, profile.familyId), { groceryList: updGroceryList });
  };

  const onDragEnd = ({ type, source, destination }: DropResult) => {
    if (!family || !profile) return;
    if (!source || !destination || !type) return;

    if (type === 'gListItem') {
      const newGList = [...family.groceryList];
      const listItem = newGList[source.index];

      newGList.splice(source.index, 1);
      newGList.splice(destination.index, 0, listItem);

      updateDoc(doc(db, FsCol.Families, profile.familyId), { groceryList: newGList });
    }
  };

  const numItemsSelected = useMemo(() => family?.groceryList.filter((item) => item.isBought).length ?? 0, [family]);

  if (!profile || !family) {
    return null;
  }

  return (
    <Box mt={2} p={2}>
      <Heading mb={2}>Grocery List</Heading>

      <Stack direction='row' mt={2}>
        <Button size='sm' leftIcon={<MdAdd />} onClick={() => setIsAdding(true)}>
          Add item
        </Button>

        <Button
          size='sm'
          leftIcon={<MdEdit />}
          onClick={() => setItemToEdit(family.groceryList.find((item) => item.isBought))}
          isDisabled={numItemsSelected !== 1}
        >
          Edit
        </Button>

        <Button
          size='sm'
          leftIcon={<MdDelete />}
          onClick={removeGroceryItems}
          colorScheme='red'
          isDisabled={numItemsSelected === 0}
        >
          Remove checked
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
        initialValue={itemToEdit?.name}
        titleVerb={'Add'}
        fieldName={'Grocery item'}
        fieldType={'EntityName'}
        isOpen={isAdding || !!itemToEdit}
        onClosed={() => {
          setIsAdding(false);
          setItemToEdit(undefined);
        }}
        onSubmitValue={addOrEditGroceryItem}
      />
    </Box>
  );
};

export default GroceryList;
