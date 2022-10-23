import React, { useContext, useEffect, useMemo, useState } from 'react';
import NoFamily from 'components/NoFamily';
import { UserContext, AppContext } from 'providers/AppProvider';
import { FirebaseContext } from 'providers/FirebaseProvider';
import { DocTypes } from '../src/Firebase';
import { Paper, Typography, Box, List, ListItem, Checkbox, Button, FormControlLabel } from '@mui/material';
import { arrayUnion, doc, onSnapshot } from 'firebase/firestore';
import NoProfile from 'components/NoProfile';
import { Family } from 'models/types';
import SingleFieldDialog from 'components/Inputs/SingleFieldDialog';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';

const GroceryList = () => {
  const { setSnackbarData } = useContext(AppContext);
  const firebase = useContext(FirebaseContext);
  const { profile, family, setFamily } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);

  if (!profile) {
    return <NoProfile />;
  }

  if (!family) {
    return <NoFamily />;
  }

  const addGroceryItem = (newItemName?: string) => {
    if (!newItemName) return;

    firebase
      .updateFamily(profile.familyId, { groceryList: arrayUnion({ name: newItemName, isBought: false }) })
      .then(() => {
        setSnackbarData({ msg: 'Successfully added item!', severity: 'success' });
      });
  };

  const editGroceryItem = (idx: number, newName: string | undefined, isBought: boolean) => {
    const updGroceryList = [...family.groceryList];

    if (newName) {
      updGroceryList[idx].name = newName;
    }

    updGroceryList[idx].isBought = isBought;

    firebase.updateFamily(profile.familyId, { groceryList: updGroceryList });
  };

  const removeGroceryItems = () => {
    const updGroceryList = family.groceryList.filter((val) => val.isBought === false);

    firebase.updateFamily(profile.familyId, { groceryList: updGroceryList });
  };

  const onDragEnd = ({ type, source, destination }: DropResult) => {
    if (!source || !destination || !type) return;

    if (type === 'gListItem') {
      const newGList = [...family.groceryList];
      const listItem = newGList[source.index];

      newGList.splice(source.index, 1);
      newGList.splice(destination.index, 0, listItem);

      firebase.updateFamily(profile.familyId, { groceryList: newGList });
    }
  };

  const isItemSelected = useMemo(
    () => family.groceryList.length > 0 && family.groceryList.some((item) => item.isBought),
    [family.groceryList]
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(firebase.db, DocTypes.family, profile.familyId), (doc) => {
      const updFam = doc.data() as Family;

      if (updFam) {
        setFamily(updFam);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Box maxWidth='md' mx='auto' mt={2}>
      <Paper sx={{ p: 2 }}>
        <Typography variant='h3' mb={2}>
          Grocery List
        </Typography>

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
                        <FormControlLabel
                          control={
                            <Checkbox
                              sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                              checked={groceryItem.isBought}
                              onChange={(e) => editGroceryItem(idx, undefined, e.target.checked)}
                            />
                          }
                          label={groceryItem.name}
                        />
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
      </Paper>

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
