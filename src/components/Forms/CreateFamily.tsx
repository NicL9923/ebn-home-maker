import React, { BaseSyntheticEvent } from 'react';
import { Family } from 'models/types';
import { v4 as uuidv4 } from 'uuid';
import { useUserStore } from 'state/UserStore';
import { doc, writeBatch } from 'firebase/firestore';
import { db, FsCol } from '../../firebase';
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
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

const createFamilySchema = yup
  .object({
    name: yup.string().required(`A name is required for your family`),
  })
  .required();

interface CreateFamilyFormSchema {
  name: string;
}

interface CreateFamilyProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const CreateFamily = ({ isOpen, setIsOpen }: CreateFamilyProps) => {
  const toast = useToast();
  const userId = useUserStore((state) => state.userId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFamilyFormSchema>({
    resolver: yupResolver(createFamilySchema),
  });

  const batch = writeBatch(db);

  const createFamily = (createFamilyData: CreateFamilyFormSchema, event?: BaseSyntheticEvent) => {
    event?.preventDefault();
    if (!userId) return;

    const newFamId = uuidv4();
    const newFamObj: Family = {
      name: createFamilyData.name,
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

    batch.commit().then(() => {
      toast({
        title: 'Successfully created family!',
        status: 'success',
        isClosable: true,
      });

      setIsOpen(false);
      reset();
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Family</ModalHeader>

        <form onSubmit={handleSubmit(createFamily)} method='post'>
          <ModalBody>
            <FormControl isInvalid={!!errors.name?.message}>
              <FormLabel>Family (Last) Name</FormLabel>
              <Input type='text' {...register('name')} />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button type='button' onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type='submit' ml={3} colorScheme='green'>
              Create
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CreateFamily;
