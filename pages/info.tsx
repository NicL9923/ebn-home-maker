import React, { useContext, useState } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import { UserContext } from '../src/providers/AppProvider';
import { FirebaseContext } from '../src/providers/FirebaseProvider';
import { Edit, Save } from '@mui/icons-material';
import NoFamily from '../src/components/NoFamily';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import dynamic from 'next/dynamic';

const MDEditor = dynamic(() => import('@uiw/react-md-editor').then((mod) => mod.default), { ssr: false });
const EditorMarkdown = dynamic(
  () =>
    import('@uiw/react-md-editor').then((mod) => {
      return mod.default.Markdown;
    }),
  { ssr: false }
);

const Information = (): JSX.Element => {
  const firebase = useContext(FirebaseContext);
  const { userId, profile, family, getFamily } = useContext(UserContext);
  const [isEditingMd, setIsEditingMd] = useState(false);
  const [editedMd, setEditedMd] = useState<string | undefined>(undefined);

  if (!family) {
    return <NoFamily />;
  }

  const beginEditingBoard = () => {
    setEditedMd(family.boardMarkdown);
    setIsEditingMd(true);
  };

  const endEditingBoard = () => {
    if (!profile) return;

    setIsEditingMd(false);

    if (editedMd === family.boardMarkdown) return;

    firebase
      .updateFamily(profile.familyId, {
        boardMarkdown: editedMd,
      })
      .then(() => {
        getFamily();
        setEditedMd(undefined);
      });
  };

  return (
    <Box maxWidth='lg' mx='auto' mt={2}>
      <Typography variant='h3' mb={2}>
        Information
      </Typography>

      <Paper sx={{ p: 2, mt: 3 }}>
        <Box data-color-mode='light'>
          <Typography variant='h4' mb={2}>
            Family Board
          </Typography>

          {isEditingMd ? (
            <MDEditor value={editedMd} onChange={setEditedMd} />
          ) : (
            <EditorMarkdown style={{ padding: 15 }} source={family.boardMarkdown} />
          )}

          <Box mt={3}>
            {userId === family.headOfFamily && !isEditingMd && (
              <Button variant='contained' startIcon={<Edit />} onClick={beginEditingBoard}>
                Edit Board
              </Button>
            )}
            {userId === family.headOfFamily && isEditingMd && (
              <Button variant='contained' startIcon={<Save />} onClick={endEditingBoard}>
                Save Changes
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Information;
