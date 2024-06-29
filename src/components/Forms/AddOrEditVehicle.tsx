import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
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
import { getNewVehicleTemplate } from '../../constants';
import { useUserStore } from '../../state/UserStore';
import FileDropzone from '../Inputs/FileDropzone';
import { Vehicle } from '../../models/types';

const addOrEditVehicleSchema = yup
  .object({
    year: yup.string().required(`You must give your vehicle a name`),
    make: yup.string().required(`You must provide your vehicle's make`),
    model: yup.string().required(`You must provide your vehicle's model`),
    trim: yup.string().defined(),
    engine: yup.string().defined(),
    vin: yup.string().defined(),
    licensePlate: yup.string().defined(),
    miles: yup.number().required(`You must provide your vehicle's mileage`),
    fuelCapacity: yup.string().defined(),
    photo: yup.mixed<File>(),
  });

type AddOrEditVehicleFormSchema = yup.InferType<typeof addOrEditVehicleSchema>;

interface AddOrEditVehicleProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  existingVehicle?: Vehicle;
}

const AddOrEditVehicle = (props: AddOrEditVehicleProps) => {
  const { isOpen, setIsOpen, existingVehicle } = props;

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
    resolver: yupResolver(addOrEditVehicleSchema),
  });

  const [isAddingOrEditingVehicle, setIsAddingOrEditingVehicle] = useState(false);

  const addNewVehicle = async (newVehicleData: AddOrEditVehicleFormSchema, event?: BaseSyntheticEvent) => {
    event?.preventDefault();
    if (!family || !profile) return;

    setIsAddingOrEditingVehicle(true);

    const { year, make, model, trim, engine, vin, licensePlate, miles, fuelCapacity, photo } = newVehicleData;
    const imgLink = photo ? await Client.uploadImageAndGetUrl(photo) : undefined;
    const newVehicleTemplate = getNewVehicleTemplate(year, make, model, trim, engine, vin, licensePlate, miles, fuelCapacity);

    if (imgLink) {
      newVehicleTemplate.img = imgLink;
    }

    await Client.createNewVehicle(profile.familyId, family, newVehicleTemplate);

    toast({
      title: 'Successfully added vehicle!',
      status: 'success',
      isClosable: true,
    });

    setIsOpen(false);
    setIsAddingOrEditingVehicle(false);
    reset();
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{!!existingVehicle ? 'Edit' : 'Add'} vehicle</ModalHeader>

        <form onSubmit={handleSubmit(addNewVehicle)} method='post'>
          <ModalBody>
            <FormControl isInvalid={!!errors.year?.message}>
              <FormLabel>Model Year</FormLabel>
              <Input type='text' placeholder='2016' {...register('year')} />
              <FormErrorMessage>{errors.year?.message}</FormErrorMessage>
            </FormControl>

            <Stack direction='row' alignItems='center' spacing={1}>
              <FormControl isInvalid={!!errors.make?.message}>
                <FormLabel>Make</FormLabel>
                <Input type='text' placeholder='Chevrolet, Ford, Dodge, Toyota...' {...register('make')} />
                <FormErrorMessage>{errors.make?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.model?.message}>
                <FormLabel>Model</FormLabel>
                <Input type='text' placeholder='F150, Corolla, Tahoe...' {...register('model')} />
                <FormErrorMessage>{errors.model?.message}</FormErrorMessage>
              </FormControl>
            </Stack>

            <Stack direction='row' alignItems='center' spacing={1}>
              <FormControl isInvalid={!!errors.trim?.message}>
                <FormLabel>Trim</FormLabel>
                <Input type='text' placeholder='SE, Limited, Lariat...' {...register('trim')} />
                <FormErrorMessage>{errors.trim?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.engine?.message}>
                <FormLabel>Engine</FormLabel>
                <Input type='text' placeholder='2.5L 4-Cyl, 3.5L V6...' {...register('engine')} />
                <FormErrorMessage>{errors.engine?.message}</FormErrorMessage>
              </FormControl>
            </Stack>

            <FormControl isInvalid={!!errors.fuelCapacity?.message}>
                <FormLabel>Fuel capacity</FormLabel>
                <Input type='text' placeholder='12 gals' {...register('fuelCapacity')} />
                <FormErrorMessage>{errors.fuelCapacity?.message}</FormErrorMessage>
              </FormControl>

            <FormControl isInvalid={!!errors.vin?.message}>
              <FormLabel>VIN</FormLabel>
              <Input type='text' placeholder='Vehicle Identification Number' {...register('vin')} />
              <FormErrorMessage>{errors.vin?.message}</FormErrorMessage>
              <FormHelperText>Just for your own reference!</FormHelperText>
            </FormControl>

            <Stack direction='row' alignItems='center' spacing={1}>
              <FormControl isInvalid={!!errors.licensePlate?.message}>
                <FormLabel>License Plate</FormLabel>
                <Input type='text' {...register('licensePlate')} />
                <FormErrorMessage>{errors.licensePlate?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.miles?.message}>
                <FormLabel>Odometer</FormLabel>
                <Input type='number' {...register('miles')} />
                <FormErrorMessage>{errors.miles?.message}</FormErrorMessage>
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
            <Button type='submit' ml={3} colorScheme='green' isLoading={isAddingOrEditingVehicle}>
              Save
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddOrEditVehicle;
