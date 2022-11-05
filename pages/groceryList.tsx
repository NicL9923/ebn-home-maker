import React, { useMemo, useState } from 'react';
import NoFamily from 'components/NoFamily';
import { doc } from 'firebase/firestore';
import NoProfile from 'components/NoProfile';
import SingleFieldDialog from 'components/Inputs/SingleFieldDialog';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { useUserStore } from 'state/UserStore';
import { useFirestoreDocumentMutation } from '@react-query-firebase/firestore';
import { db, FsCol } from '../src/firebase';
import { Box, Button, Checkbox, List, ListItem, Text, useToast } from '@chakra-ui/react';

const GroceryList = () => {
  const toast = useToast();
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const [isEditing, setIsEditing] = useState(false);

  const familyDocMutation = useFirestoreDocumentMutation(doc(db, FsCol.Families, profile?.familyId ?? 'undefined'), {
    merge: true,
  });

  if (!profile) {
    return <NoProfile />;
  }

  if (!family) {
    return <NoFamily />;
  }

  const addGroceryItem = (newItemName?: string) => {
    if (!newItemName) return;

    const newList = [...family.groceryList, { name: newItemName, isBought: false }];

    familyDocMutation.mutate(
      { groceryList: newList },
      {
        onSuccess() {
          toast({
            title: 'Successfully added item!',
            status: 'success',
            isClosable: true,
          });
        },
      }
    );
  };

  const editGroceryItem = (idx: number, newName: string | undefined, isBought: boolean) => {
    const updGroceryList = [...family.groceryList];

    if (newName) {
      updGroceryList[idx].name = newName;
    }

    updGroceryList[idx].isBought = isBought;

    familyDocMutation.mutate({ groceryList: updGroceryList });
  };

  const removeGroceryItems = () => {
    const updGroceryList = family.groceryList.filter((val) => val.isBought === false);

    familyDocMutation.mutate({ groceryList: updGroceryList });
  };

  const onDragEnd = ({ type, source, destination }: DropResult) => {
    if (!source || !destination || !type) return;

    if (type === 'gListItem') {
      const newGList = [...family.groceryList];
      const listItem = newGList[source.index];

      newGList.splice(source.index, 1);
      newGList.splice(destination.index, 0, listItem);

      familyDocMutation.mutate({ groceryList: newGList });
    }
  };

  const isItemSelected = useMemo(
    () => family.groceryList.length > 0 && family.groceryList.some((item) => item.isBought),
    [family.groceryList]
  );

  return (
    <Box maxWidth='md' mx='auto' mt={2} p={2}>
      <Text variant='h3' mb={2}>
        Grocery List
      </Text>

      <Button variant='contained' onClick={() => setIsEditing(true)}>
        Add item
      </Button>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId='groceryList' type='gListItem'>
          {(provided) => (
            <List {...provided.droppableProps} ref={provided.innerRef} sx={{ mt: 2 }}>
              {family.groceryList.map((groceryItem, idx) => (
                <Draggable draggableId={`${idx}`} index={idx} key={idx}>
                  {(provided) => (
                    <ListItem {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                      <Checkbox
                        size='lg'
                        checked={groceryItem.isBought}
                        onChange={(e) => editGroceryItem(idx, undefined, e.target.checked)}
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

      {isItemSelected && (
        <Button variant='outlined' onClick={removeGroceryItems} sx={{ mt: 8 }}>
          Remove checked items
        </Button>
      )}

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
