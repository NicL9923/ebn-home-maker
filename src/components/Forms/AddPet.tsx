import React, { BaseSyntheticEvent } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { useUserStore } from 'state/UserStore';
import { useFirestoreDocumentMutation } from '@react-query-firebase/firestore';
import { doc } from 'firebase/firestore';
import { db, FsCol, storage } from '../../firebase';
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import Dropzone from 'react-dropzone';

// TODO: Move dropzone to common component if/when styling it and applying other general props in the future

const addPetSchema = yup
  .object({
    name: yup.string().required(`Your pet's name is required`),
    photo: yup.mixed(),
  })
  .required();

interface AddPetFormSchema {
  name: string;
  photo: File | null;
}

interface AddPetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AddPet = ({ isOpen, setIsOpen }: AddPetProps) => {
  const toast = useToast();
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AddPetFormSchema>({
    resolver: yupResolver(addPetSchema),
  });

  const familyDocMutation = useFirestoreDocumentMutation(doc(db, FsCol.Budgets, profile?.familyId ?? 'undefined'), {
    merge: true,
  });

  const addPet = async (newPetData: AddPetFormSchema, event?: BaseSyntheticEvent) => {
    event?.preventDefault();
    if (!profile || !family) return;

    const newPetsArr = family.pets ? [...family.pets] : [];

    let imgLink: string | undefined = undefined;
    if (newPetData.photo) {
      imgLink = await getDownloadURL((await uploadBytes(ref(storage, uuidv4()), newPetData.photo)).ref);
    }

    newPetsArr.push({
      name: newPetData.name,
      imgLink,
    });

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

    setIsOpen(false);
    reset();
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Pet</ModalHeader>

        <form onSubmit={handleSubmit(addPet)} method='post'>
          <ModalBody>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input type='text' {...register('name')} />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Photo</FormLabel>
              <Controller
                name='photo'
                control={control}
                render={({ field }) => (
                  <Dropzone
                    accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }}
                    onDrop={(acceptedFiles) => field.onChange(acceptedFiles[0])}
                    // TODO: maxSize (in bytes)
                  />
                )}
              />
              <FormErrorMessage>{errors.photo?.message}</FormErrorMessage>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button type='button' onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type='submit'>Add</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddPet;
