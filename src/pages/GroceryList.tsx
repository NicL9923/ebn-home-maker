import React, { useContext, useState } from 'react';
import NoFamily from 'components/NoFamily';
import { DocTypes, FirebaseContext } from '../Firebase';
import { UserContext } from 'App';
import { Paper, Typography, Box, List, ListItem, Checkbox, Button, FormControlLabel } from '@mui/material';
import { arrayUnion, doc, onSnapshot } from 'firebase/firestore';
import NoProfile from 'components/NoProfile';
import { Family } from 'models/types';
import SingleFieldDialog from 'components/Inputs/SingleFieldDialog';

const GroceryList = () => {
  const firebase = useContext(FirebaseContext);
  const { profile, family, setFamily } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);

  if (!profile) {
    return <NoProfile />;
  }

  if (!family) {
    return <NoFamily />;
  }

  onSnapshot(doc(firebase.db, DocTypes.family, profile.familyId), (doc) => {
    const updFam = doc.data() as Family;

    if (updFam) {
      setFamily(updFam);
    }
  });

  const addGroceryItem = (newItemName?: string) => {
    if (!newItemName) return;

    firebase.updateFamily(profile.familyId, { groceryList: arrayUnion({ name: newItemName, isBought: false }) });
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

  return (
    <Box maxWidth='md' mx='auto' mt={2}>
      <Paper sx={{ p: 2 }}>
        <Typography variant='h3' mb={2}>
          Grocery List
        </Typography>

        <Button variant='contained' onClick={() => setIsEditing(true)}>
          Add item
        </Button>

        <List sx={{ mt: 2 }}>
          {family.groceryList.map((groceryItem, idx) => (
            <ListItem key={idx}>
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
          ))}
        </List>

        {family.groceryList.length > 0 && family.groceryList.some((item) => item.isBought) && (
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
