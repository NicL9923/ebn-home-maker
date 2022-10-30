import React, { useState } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import { Edit, Save } from '@mui/icons-material';
import NoFamily from '../src/components/NoFamily';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import dynamic from 'next/dynamic';
import { useUserStore } from '../src/state/UserStore';
import { useFirestoreDocumentMutation } from '@react-query-firebase/firestore';
import { doc } from 'firebase/firestore';
import { db, FsCol } from '../src/firebase';

const MDEditor = dynamic(() => import('@uiw/react-md-editor').then((mod) => mod.default), { ssr: false });
const EditorMarkdown = dynamic(
  () =>
    import('@uiw/react-md-editor').then((mod) => {
      return mod.default.Markdown;
    }),
  { ssr: false }
);

const Information = () => {
  const userId = useUserStore((state) => state.userId);
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const [isEditingMd, setIsEditingMd] = useState(false);
  const [editedMd, setEditedMd] = useState<string | undefined>(undefined);

  const familyDocMutation = useFirestoreDocumentMutation(doc(db, FsCol.Families, profile?.familyId ?? 'undefined'), {
    merge: true,
  });

  if (!family) {
    return <NoFamily />;
  }

  const beginEditingBoard = () => {
    setEditedMd(family.boardMarkdown);
    setIsEditingMd(true);
  };

  const endEditingBoard = () => {
    if (profile && editedMd !== family.boardMarkdown) {
      familyDocMutation.mutate(
        { boardMarkdown: editedMd },
        {
          onSuccess() {
            setEditedMd(undefined);
          },
        }
      );
    }

    setIsEditingMd(false);
  };

  return (
    <Box maxWidth='lg' mx='auto' mt={2}>
      <Typography variant='h3' mb={2}>
        Information
      </Typography>

      <Paper sx={{ p: 2, mt: 3 }}>
        <Box>
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
