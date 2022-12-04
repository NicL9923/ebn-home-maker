import React, { BaseSyntheticEvent } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useUserStore } from 'state/UserStore';
import { doc, writeBatch } from 'firebase/firestore';
import { db, FsCol, storage } from '../../firebase';
import { GenericObject } from 'models/types';
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
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FileDropzone from 'components/Inputs/FileDropzone';
import { genUuid } from 'utils/utils';

const createProfileSchema = yup
  .object({
    name: yup.string().required(`You must provide your first name`),
    photo: yup.mixed(),
  })
  .required();

interface CreateProfileFormSchema {
  name: string;
  photo: File | null;
}

interface CreateProfileProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const CreateProfile = ({ isOpen, setIsOpen }: CreateProfileProps) => {
  const toast = useToast();
  const userId = useUserStore((state) => state.userId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateProfileFormSchema>({
    resolver: yupResolver(createProfileSchema),
  });

  const batch = writeBatch(db);

  const createProfile = async (createProfileData: CreateProfileFormSchema, event?: BaseSyntheticEvent) => {
    event?.preventDefault();
    if (!userId) return;

    const newProfileObj: GenericObject = { firstName: createProfileData.name, familyId: '' };

    if (createProfileData.photo) {
      newProfileObj.imgLink = await getDownloadURL(
        (
          await uploadBytes(ref(storage, genUuid()), createProfileData.photo)
        ).ref
      );
    }

    batch.set(doc(db, FsCol.Profiles, userId), newProfileObj);

    batch.commit().then(() => {
      toast({
        title: 'Successfully created profile!',
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
        <ModalHeader>Create Profile</ModalHeader>

        <form onSubmit={handleSubmit(createProfile)} method='post'>
          <ModalBody>
            <FormControl isInvalid={!!errors.name?.message}>
              <FormLabel>First Name</FormLabel>
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
            <Button type='submit' ml={3} colorScheme='green'>
              Create
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CreateProfile;
