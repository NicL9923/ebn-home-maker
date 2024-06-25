import { useState } from 'react';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { useUserStore } from '../state/UserStore';
import { doc, updateDoc } from 'firebase/firestore';
import { db, FsCol } from '../firebase';
import { Box, Button, Heading, Stack, useColorMode } from '@chakra-ui/react';
import { MdClose, MdEdit, MdSave } from 'react-icons/md';
import MDEditor from '@uiw/react-md-editor';

const FamilyBoard = () => {
  const { colorMode } = useColorMode();
  const userId = useUserStore((state) => state.userId);
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const [isEditingMd, setIsEditingMd] = useState(false);
  const [editedMd, setEditedMd] = useState<string | undefined>(undefined);

  if (!family) {
    return null;
  }

  const beginEditingBoard = () => {
    setEditedMd(family.boardMarkdown);
    setIsEditingMd(true);
  };

  const endEditingBoard = async (cancelled: boolean) => {
    if (profile && !cancelled) {
      await updateDoc(doc(db, FsCol.Families, profile.familyId), { boardMarkdown: editedMd });
      setEditedMd(undefined);
    }

    setIsEditingMd(false);
  };

  return (
    <Box p={2}>
      <Heading mb={2}>Family Board</Heading>

      <Stack direction='row' mb={3}>
        {userId === family.headOfFamily && !isEditingMd && (
          <Button size='sm' leftIcon={<MdEdit />} onClick={beginEditingBoard}>
            Edit board
          </Button>
        )}

        {userId === family.headOfFamily && isEditingMd && (
          <Button size='sm' leftIcon={<MdSave />} colorScheme='green' onClick={() => endEditingBoard(false)} disabled={editedMd === family.boardMarkdown}>
            Save changes
          </Button>
        )}

        {isEditingMd &&
          <Button size='sm' leftIcon={<MdClose />} onClick={() => endEditingBoard(true)}>
            Cancel
          </Button>
        }
      </Stack>

      <Box data-color-mode={colorMode} height='calc(100vh - 250px)'>
        {isEditingMd ? (
          <MDEditor value={editedMd} onChange={setEditedMd} height='100%' />
        ) : (
          <MDEditor.Markdown style={{ height: '100%', overflow: 'auto' }} source={family.boardMarkdown} />
        )}
      </Box>
    </Box>
  );
};

export default FamilyBoard;
