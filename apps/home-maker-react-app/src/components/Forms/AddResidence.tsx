import React, { BaseSyntheticEvent, useState } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useUserStore } from 'state/UserStore';
import { db, FsCol, storage } from '../../firebase';
import { doc, writeBatch } from 'firebase/firestore';
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
  Spinner,
  Stack,
  useToast,
} from '@chakra-ui/react';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FileDropzone from 'components/Inputs/FileDropzone';
import { genUuid } from 'utils/utils';
import { Residence } from 'models/types';

const addResidenceSchema = yup
  .object({
    name: yup.string().required(`You must give your residence a name`),
    yearBuilt: yup.string().required('You must provide the year your residence was built'),
    yearPurchased: yup.string().required('You must provide the year your residence was purchased'),
    photo: yup.mixed(),
  })
  .required();

interface AddResidenceFormSchema {
  name: string;
  yearBuilt: string;
  yearPurchased: string;
  photo: File | null;
}

interface AddResidenceProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AddResidence = ({ isOpen, setIsOpen }: AddResidenceProps) => {
  const toast = useToast();
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AddResidenceFormSchema>({
    resolver: yupResolver(addResidenceSchema),
  });

  const batch = writeBatch(db);

  const [isAddingResidence, setIsAddingResidence] = useState(false);

  const addNewResidence = async (newResidenceData: AddResidenceFormSchema, event?: BaseSyntheticEvent) => {
    event?.preventDefault();
    if (!family || !profile) return;

    setIsAddingResidence(true);

    const newResId = genUuid();

    let newResIdArr: string[] = [];
    if (family.residences) {
      newResIdArr = [...family.residences];
    }
    newResIdArr.push(newResId);

    const newResidence: Residence = {
      uid: newResId,
      maintenanceMarkers: [],
      serviceLogEntries: [],
      ...newResidenceData,
    };

    if (newResidenceData.photo) {
      newResidence.img = await getDownloadURL((await uploadBytes(ref(storage, genUuid()), newResidenceData.photo)).ref);
    }

    batch.set(doc(db, FsCol.Residences, newResId), newResidence);
    batch.update(doc(db, FsCol.Families, profile.familyId), {
      residences: newResIdArr,
    });

    batch.commit().then(() => {
      toast({
        title: 'Successfully added residence!',
        status: 'success',
        isClosable: true,
      });

      setIsOpen(false);
      setIsAddingResidence(false);
      reset();
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Residence</ModalHeader>

        <form onSubmit={handleSubmit(addNewResidence)} method='post'>
          <ModalBody>
            <FormControl isInvalid={!!errors.name?.message}>
              <FormLabel>Name</FormLabel>
              <Input type='text' placeholder='My house!' {...register('name')} />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>

            <Stack direction='row' alignItems='center' spacing={1}>
              <FormControl isInvalid={!!errors.yearBuilt?.message}>
                <FormLabel>Year Built</FormLabel>
                <Input type='text' {...register('yearBuilt')} />
                <FormErrorMessage>{errors.yearBuilt?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.yearPurchased?.message}>
                <FormLabel>Year Purchased</FormLabel>
                <Input type='text' {...register('yearPurchased')} />
                <FormErrorMessage>{errors.yearPurchased?.message}</FormErrorMessage>
              </FormControl>
            </Stack>

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
            <Button type='submit' ml={3} colorScheme='green' disabled={isAddingResidence}>
              {isAddingResidence ? <Spinner /> : 'Add'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddResidence;
