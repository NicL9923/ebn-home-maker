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

const addResidenceSchema = yup
  .object({
    name: yup.string().required(`You must give your residence a name`),
    yearBuilt: yup.string().required('You must provide the year your residence was built'),
    yearPurchased: yup.string().required('You must provide the year your residence was purchased'),
    photo: yup.mixed<File>(),
  });

type AddResidenceFormSchema = yup.InferType<typeof addResidenceSchema>;

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
  } = useForm({
    resolver: yupResolver(addResidenceSchema),
  });

  const [isAddingResidence, setIsAddingResidence] = useState(false);

  const addNewResidence = async (newResidenceData: AddResidenceFormSchema, event?: BaseSyntheticEvent) => {
    event?.preventDefault();
    if (!family || !profile) return;

    setIsAddingResidence(true);

    const { name, yearBuilt, yearPurchased, photo } = newResidenceData;
    const imgLink = photo ? await Client.uploadImageAndGetUrl(photo) : undefined;
    const newResidenceTemplate = getNewResidenceTemplate(name, yearBuilt, yearPurchased, imgLink);

    await Client.createNewResidence(profile.familyId, family, newResidenceTemplate);

    toast({
      title: 'Successfully added residence!',
      status: 'success',
      isClosable: true,
    });

    setIsOpen(false);
    setIsAddingResidence(false);
    reset();
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
                    onDrop={(acceptedFiles) => field.onChange(acceptedFiles[0])} // TODO: FileWITHPREVIEW
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
            <Button type='submit' ml={3} colorScheme='green' isLoading={isAddingResidence}>
              Add
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddResidence;
