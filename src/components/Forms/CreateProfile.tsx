import React, { useState } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { useUserStore } from 'state/UserStore';
import { doc, writeBatch } from 'firebase/firestore';
import { db, FsCol, storage } from '../../firebase';
import { useFirestoreWriteBatch } from '@react-query-firebase/firestore';
import { GenericObject } from 'models/types';
import { Button, Input, Modal, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useToast } from '@chakra-ui/react';

// TODO: File dropzone

interface CreateProfileProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const CreateProfile = ({ isOpen, setIsOpen }: CreateProfileProps) => {
  const toast = useToast();
  const userId = useUserStore((state) => state.userId);

  const [newName, setNewName] = useState<string | undefined>(undefined);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);

  const batch = writeBatch(db);
  const batchMutation = useFirestoreWriteBatch(batch);

  // TODO: Replace this w/ new validation
  const isNameValid = (): boolean => {
    if (!newName) {
      setNameError('You must input a name!');
      return false;
    } else if (newName.includes(' ')) {
      setNameError('The name cannot contain spaces!');
      return false;
    } else {
      setNameError(undefined);
      return true;
    }
  };

  const createProfile = async () => {
    if (!isNameValid() || !userId || !newName) return;

    const newProfileObj: GenericObject = { firstName: newName, familyId: '' };

    if (newPhoto) {
      newProfileObj.imgLink = await getDownloadURL((await uploadBytes(ref(storage, uuidv4()), newPhoto)).ref);
    }

    batch.set(doc(db, FsCol.Profiles, userId), newProfileObj);

    batchMutation.mutate(undefined, {
      onSuccess() {
        toast({
          title: 'Successfully created profile!',
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
        <ModalHeader>Create Profile</ModalHeader>

        <Input
          type='text'
          autoFocus
          variant='standard'
          label='First Name'
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          required
          error={!!nameError}
          helperText={nameError}
        />

        <InputLabel sx={{ mt: 3 }}>Upload Photo</InputLabel>
        <DropzoneArea
          acceptedFiles={['image/jpeg', 'image/png']}
          filesLimit={1}
          onChange={(files) => setNewPhoto(files[0])}
          fileObjects={[]}
        />

        <ModalFooter>
          <Button onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button variant='contained' onClick={createProfile}>
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateProfile;
