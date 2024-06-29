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
  Stack,
  useToast,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { BaseSyntheticEvent, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import Client from '../../Client';
import { getNewResidenceTemplate } from '../../constants';
import { useUserStore } from '../../state/UserStore';
import FileDropzone from '../Inputs/FileDropzone';
import { Residence } from '../../models/types';

const addOrEditResidenceSchema = yup
  .object({
    name: yup.string().required(`You must give your residence a name`),
    yearBuilt: yup.string().required('You must provide the year your residence was built'),
    yearPurchased: yup.string().required('You must provide the year your residence was purchased'),
    photo: yup.mixed<File>(),
  });

type AddOrEditResidenceFormSchema = yup.InferType<typeof addOrEditResidenceSchema>;

interface AddOrEditResidenceProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  existingResidence?: Residence;
}

const AddOrEditResidence = (props: AddOrEditResidenceProps) => {
  const { isOpen, setIsOpen, existingResidence } = props;

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
    resolver: yupResolver(addOrEditResidenceSchema),
  });

  const [isAddingOrEditingResidence, setIsAddingOrEditingResidence] = useState(false);

  const addNewResidence = async (newResidenceData: AddOrEditResidenceFormSchema, event?: BaseSyntheticEvent) => {
    event?.preventDefault();
    if (!family || !profile) return;

    setIsAddingOrEditingResidence(true);

    const { name, yearBuilt, yearPurchased, photo } = newResidenceData;
    const imgLink = photo ? await Client.uploadImageAndGetUrl(photo) : undefined;
    const newResidenceTemplate = getNewResidenceTemplate(name, yearBuilt, yearPurchased);

    if (imgLink) {
      newResidenceTemplate.img = imgLink;
    }

    await Client.createNewResidence(profile.familyId, family, newResidenceTemplate);

    toast({
      title: 'Successfully added residence!',
      status: 'success',
      isClosable: true,
    });

    setIsOpen(false);
    setIsAddingOrEditingResidence(false);
    reset();
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{!!existingResidence ? 'Edit' : 'Add'} residence</ModalHeader>

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
                  <FileDropzone file={field.value} setFile={field.onChange} />
                )}
              />
              <FormErrorMessage>{errors.photo?.message}</FormErrorMessage>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button type='button' onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type='submit' ml={3} colorScheme='green' isLoading={isAddingOrEditingResidence}>
              Save
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddOrEditResidence;
