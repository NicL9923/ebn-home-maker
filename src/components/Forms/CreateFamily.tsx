import React, { useState } from 'react';
import { Family } from 'models/types';
import { v4 as uuidv4 } from 'uuid';
import { useUserStore } from 'state/UserStore';
import { doc, writeBatch } from 'firebase/firestore';
import { useFirestoreWriteBatch } from '@react-query-firebase/firestore';
import { db, FsCol } from '../../firebase';
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  useToast,
} from '@chakra-ui/react';

interface CreateFamilyProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const CreateFamily = ({ isOpen, setIsOpen }: CreateFamilyProps) => {
  const toast = useToast();

  const userId = useUserStore((state) => state.userId);

  const [newName, setNewName] = useState<string | undefined>(undefined);

  const batch = writeBatch(db);
  const batchMutation = useFirestoreWriteBatch(batch);

  const createFamily = () => {
    if (!userId || !newName) return;

    const newFamId = uuidv4();
    const newFamObj: Family = {
      name: newName,
      headOfFamily: userId,
      members: [userId],
      boardMarkdown: 'This is the family board!',
      pets: [],
      vehicles: [],
      residences: [],
      groceryList: [],
      cityState: 'Seattle,WA', // This'll be the default, because why not!
    };

    batch.set(doc(db, FsCol.Families, newFamId), newFamObj);
    batch.update(doc(db, FsCol.Profiles, userId), { familyId: newFamId });

    batchMutation.mutate(undefined, {
      onSuccess() {
        toast({
          title: 'Successfully created family!',
          status: 'success',
          isClosable: true,
        });
      },
    });

    setIsOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Family</ModalHeader>
        <Stack>
          <Input
            type='text'
            autoFocus
            variant='standard'
            label='Family (Last) Name'
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            required
          />
        </Stack>

        <ModalFooter>
          <Button onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button variant='contained' onClick={createFamily}>
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateFamily;
