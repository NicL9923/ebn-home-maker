import React, { useState } from 'react';
import NoFamily from '../src/components/NoFamily';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import dynamic from 'next/dynamic';
import { useUserStore } from '../src/state/UserStore';
import { useFirestoreDocumentMutation } from '@react-query-firebase/firestore';
import { doc } from 'firebase/firestore';
import { db, FsCol } from '../src/firebase';
import { Box, Button, Heading, useColorMode } from '@chakra-ui/react';
import { MdEdit, MdSave } from 'react-icons/md';

const MDEditor = dynamic(() => import('@uiw/react-md-editor').then((mod) => mod.default), { ssr: false });
const EditorMarkdown = dynamic(
  () =>
    import('@uiw/react-md-editor').then((mod) => {
      return mod.default.Markdown;
    }),
  { ssr: false }
);

const Information = () => {
  const { colorMode } = useColorMode();
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
    <Box p={2} mt={2}>
      <Heading mb={2}>Family Board</Heading>

      <Box mb={3}>
        {userId === family.headOfFamily && !isEditingMd && (
          <Button size='sm' leftIcon={<MdEdit />} onClick={beginEditingBoard}>
            Edit Board
          </Button>
        )}
        {userId === family.headOfFamily && isEditingMd && (
          <Button size='sm' leftIcon={<MdSave />} colorScheme='green' onClick={endEditingBoard}>
            Save Changes
          </Button>
        )}
      </Box>

      <Box data-color-mode={colorMode} height='70vh'>
        {isEditingMd ? (
          <MDEditor value={editedMd} onChange={setEditedMd} height='100%' />
        ) : (
          <EditorMarkdown style={{ height: '100%' }} source={family.boardMarkdown} />
        )}
      </Box>
    </Box>
  );
};

export default Information;
