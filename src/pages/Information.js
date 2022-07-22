import React, { useContext, useState } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import MDEditor from '@uiw/react-md-editor';
import { FirebaseContext } from '..';
import { UserContext } from '../App';
import { Edit, Save } from '@mui/icons-material';
import { doc, updateDoc } from 'firebase/firestore';

/* The moral of this page is *drum roll please*... KISS */


const Information = () => {
  const { db } = useContext(FirebaseContext);
  const { userId, profile, family, getFamily } = useContext(UserContext);
  const [isEditingMd, setIsEditingMd] = useState(false);
  const [editedMd, setEditedMd] = useState(null);

  const beginEditingBoard = () => {
    setEditedMd(family.boardMarkdown);
    setIsEditingMd(true);
  };

  const endEditingBoard = () => {
    setIsEditingMd(false);

    if (editedMd === family.boardMarkdown) return;

    updateDoc(doc(db, 'families', profile.familyId), { boardMarkdown: editedMd }).then(() => {
      getFamily();
      setEditedMd(null);
    });
  };
  
  return (
    <Box maxWidth='lg' mx='auto' mt={2}>
      <Typography variant='h3' mb={2}>Information</Typography>
      
      <Paper sx={{ p: 2, mt: 3 }}>
        <Box data-color-mode='light'>
          <Typography variant='h4' mb={2}>Family Board</Typography>
          
          { isEditingMd ?
            <MDEditor value={editedMd} onChange={setEditedMd} />
            :
            <MDEditor.Markdown style={{ padding: 15 }} source={family.boardMarkdown} />
          }

          <Box mt={3}>
            { userId === family.headOfFamily && !isEditingMd &&
              <Button variant='contained' startIcon={<Edit />} onClick={beginEditingBoard}>Edit Board</Button>
            }
            { userId === family.headOfFamily && isEditingMd &&
              <Button variant='contained' startIcon={<Save />} onClick={endEditingBoard}>Save Changes</Button>
            }
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Information;
