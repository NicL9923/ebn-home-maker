import React, { useState } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { useUserStore } from 'state/UserStore';
import { useFirestoreDocumentMutation } from '@react-query-firebase/firestore';
import { doc } from 'firebase/firestore';
import { db, FsCol } from '../../firebase';
import { Button, Input, Modal, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useToast } from '@chakra-ui/react';

// TODO: All these forms (FormControl, Formik, etc)
// TODO: File dropzone

interface AddPetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AddPet = ({ isOpen, setIsOpen }: AddPetProps) => {
  const toast = useToast();
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const [newName, setNewName] = useState<string | undefined>(undefined);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);

  const familyDocMutation = useFirestoreDocumentMutation(doc(db, FsCol.Budgets, profile?.familyId ?? 'undefined'), {
    merge: true,
  });

  const addPet = () => {
    if (!profile || !family || !newName) return;

    const newPetsArr = family.pets ? [...family.pets] : [];

    // TODO: Refactor this similar to Residence/Vehicle (batch write I believe)
    if (newPhoto) {
      const storage = getStorage();
      const imgRef = ref(storage, uuidv4());
      uploadBytes(imgRef, newPhoto).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          newPetsArr.push({ name: newName, imgLink: url });
          familyDocMutation.mutate(
            { pets: newPetsArr },
            {
              onSuccess() {
                toast({
                  title: 'Successfully added pet!',
                  status: 'success',
                  isClosable: true,
                });
              },
            }
          );
        });
      });
    } else {
      newPetsArr.push({ name: newName });
      familyDocMutation.mutate(
        { pets: newPetsArr },
        {
          onSuccess() {
            toast({
              title: 'Successfully added pet!',
              status: 'success',
              isClosable: true,
            });
          },
        }
      );
    }

    setIsOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Pet</ModalHeader>

        <Input
          type='text'
          autoFocus
          variant='standard'
          label='Name'
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          required
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
          <Button variant='contained' onClick={addPet}>
            Add
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddPet;
