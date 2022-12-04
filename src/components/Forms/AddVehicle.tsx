import React, { BaseSyntheticEvent } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useUserStore } from 'state/UserStore';
import { doc, writeBatch } from 'firebase/firestore';
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
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import FileDropzone from 'components/Inputs/FileDropzone';
import { genUuid } from 'utils/utils';

const addVehicleSchema = yup
  .object({
    year: yup.string().required(`You must give your vehicle a name`),
    make: yup.string().required(`You must provide your vehicle's make`),
    model: yup.string().required(`You must provide your vehicle's model`),
    trim: yup.string(),
    engine: yup.string(),
    vin: yup.string(),
    licensePlate: yup.string(),
    miles: yup.number().required(`You must provide your vehicle's mileage`),
    photo: yup.mixed(),
  })
  .required();

interface AddVehicleFormSchema {
  year: string;
  make: string;
  model: string;
  trim: string;
  engine: string;
  vin: string;
  licensePlate: string;
  miles: number;
  photo: File | null;
}

interface AddVehicleProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AddVehicle = ({ isOpen, setIsOpen }: AddVehicleProps) => {
  const toast = useToast();
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AddVehicleFormSchema>({
    resolver: yupResolver(addVehicleSchema),
  });

  const batch = writeBatch(db);

  const addNewVehicle = async (newVehicleData: AddVehicleFormSchema, event?: BaseSyntheticEvent) => {
    event?.preventDefault();
    if (!family || !profile) return;

    const newVehId = genUuid();

    let newVehIdArr: string[] = [];
    if (family.vehicles) {
      newVehIdArr = [...family.vehicles];
    }
    newVehIdArr.push(newVehId);

    let imgUrl: string | undefined = undefined;
    if (newVehicleData.photo) {
      imgUrl = await getDownloadURL((await uploadBytes(ref(storage, genUuid()), newVehicleData.photo)).ref);
    }

    batch.set(doc(db, FsCol.Vehicles, newVehId), {
      id: newVehId,
      img: imgUrl,
      maintenanceMarkers: [],
      serviceLogEntries: [],
      ...newVehicleData,
    });
    batch.update(doc(db, FsCol.Families, profile.familyId), {
      residences: newVehIdArr,
    });

    batch.commit().then(() => {
      toast({
        title: 'Successfully added vehicle!',
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
        <ModalHeader>Add Vehicle</ModalHeader>

        <form onSubmit={handleSubmit(addNewVehicle)} method='post'>
          <ModalBody>
            <FormControl isInvalid={!!errors.year?.message}>
              <FormLabel>Model Year</FormLabel>
              <Input type='text' {...register('year')} />
              <FormErrorMessage>{errors.year?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.make?.message}>
              <FormLabel>Make</FormLabel>
              <Input type='text' placeholder='Chevrolet, Ford, Dodge, Toyota...' {...register('make')} />
              <FormErrorMessage>{errors.make?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.model?.message}>
              <FormLabel>Model</FormLabel>
              <Input type='text' placeholder='F150, Corolla, Tacoma, Tahoe...' {...register('model')} />
              <FormErrorMessage>{errors.model?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.trim?.message}>
              <FormLabel>Trim</FormLabel>
              <Input type='text' placeholder='SE, Ultimate, Limited, Lariat...' {...register('trim')} />
              <FormErrorMessage>{errors.trim?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.engine?.message}>
              <FormLabel>Engine</FormLabel>
              <Input type='text' placeholder='3.5L V6...' {...register('engine')} />
              <FormErrorMessage>{errors.engine?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.vin?.message}>
              <FormLabel>VIN (Vehicle Identification Number)</FormLabel>
              <Input type='text' {...register('vin')} />
              <FormErrorMessage>{errors.vin?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.licensePlate?.message}>
              <FormLabel>License Plate</FormLabel>
              <Input type='text' {...register('licensePlate')} />
              <FormErrorMessage>{errors.licensePlate?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.miles?.message}>
              <FormLabel>Odometer (miles)</FormLabel>
              <Input type='number' {...register('miles')} />
              <FormErrorMessage>{errors.miles?.message}</FormErrorMessage>
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
              Add
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddVehicle;
