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
import { doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { BaseSyntheticEvent, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { FsCol, db, storage } from '../../firebase';
import { Pet } from '../../models/types';
import { useUserStore } from '../../state/UserStore';
import { genUuid } from '../../utils/utils';
import FileDropzone from '../Inputs/FileDropzone';

const addPetSchema = yup
  .object({
    name: yup.string().required(`Your pet's name is required`),
    photo: yup.mixed<File>().nullable().defined(),
  });

type AddPetFormSchema = yup.InferType<typeof addPetSchema>;

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
  } = useForm({
    resolver: yupResolver(addPetSchema),
  });

  const [isAddingPet, setIsAddingPet] = useState(false);

  const addPet = async (newPetData: AddPetFormSchema, event?: BaseSyntheticEvent) => {
    event?.preventDefault();
    if (!profile || !family) return;

    setIsAddingPet(true);

    const newPetsArr = family.pets ? [...family.pets] : [];
    const newPet: Pet = {
      uid: genUuid(),
      name: newPetData.name,
    };

    if (newPetData.photo) {
      newPet.imgLink = await getDownloadURL((await uploadBytes(ref(storage, genUuid()), newPetData.photo)).ref);
    }

    newPetsArr.push(newPet);

    updateDoc(doc(db, FsCol.Families, profile.familyId), { pets: newPetsArr }).then(() => {
      toast({
        title: 'Successfully added pet!',
        status: 'success',
        isClosable: true,
      });

      setIsOpen(false);
      setIsAddingPet(false);
      reset();
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Pet</ModalHeader>

        <form onSubmit={handleSubmit(addPet)} method='post'>
          <ModalBody>
            <FormControl isInvalid={!!errors.name?.message}>
              <FormLabel>Name</FormLabel>
              <Input type='text' {...register('name')} />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.photo?.message}>
              <FormLabel>Photo</FormLabel>
              <Controller
                name='photo'
                control={control}
                render={({ field }) => (
                  <FileDropzone
                    accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }}
                    onDrop={(acceptedFiles) => field.onChange(acceptedFiles[0])}
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
            <Button type='submit' ml={3} colorScheme='green' isLoading={isAddingPet}>
              Add
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddPet;
