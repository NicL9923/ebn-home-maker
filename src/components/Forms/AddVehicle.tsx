import React, { BaseSyntheticEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useUserStore } from 'state/UserStore';
import { doc, writeBatch } from 'firebase/firestore';
import { db, FsCol, storage } from '../../firebase';
import { useFirestoreWriteBatch } from '@react-query-firebase/firestore';
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import Dropzone from 'react-dropzone';

// TODO: File dropdown

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
    formState: { errors },
  } = useForm<AddVehicleFormSchema>({
    resolver: yupResolver(addVehicleSchema),
  });

  const batch = writeBatch(db);
  const batchMutation = useFirestoreWriteBatch(batch);

  const addNewVehicle = async (newVehicleData: AddVehicleFormSchema, event?: BaseSyntheticEvent) => {
    event?.preventDefault();
    if (!family || !profile) return;

    const newVehId = uuidv4();

    let newVehIdArr: string[] = [];
    if (family.vehicles) {
      newVehIdArr = [...family.vehicles];
    }
    newVehIdArr.push(newVehId);

    let imgUrl: string | undefined = undefined;
    if (newVehicleData.photo) {
      imgUrl = await getDownloadURL((await uploadBytes(ref(storage, uuidv4()), newVehicleData.photo)).ref);
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

    batchMutation.mutate(undefined, {
      onSuccess() {
        toast({
          title: 'Successfully added vehicle!',
          status: 'success',
          isClosable: true,
        });
      },
    });

    setIsOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Vehicle</ModalHeader>

        <form onSubmit={handleSubmit(addNewVehicle)}>
          <FormControl>
            <FormLabel>Model Year</FormLabel>
            <Input type='text' {...register('year')} />
            <FormErrorMessage>{errors.year?.message}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <FormLabel>Make</FormLabel>
            <Input type='text' placeholder='Chevrolet, Ford, Dodge, Toyota...' {...register('make')} />
            <FormErrorMessage>{errors.make?.message}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <FormLabel>Model</FormLabel>
            <Input type='text' placeholder='F150, Corolla, Tacoma, Tahoe...' {...register('model')} />
            <FormErrorMessage>{errors.make?.message}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <FormLabel>Trim</FormLabel>
            <Input type='text' placeholder='SE, Ultimate, Limited, Lariat...' {...register('trim')} />
            <FormErrorMessage>{errors.make?.message}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <FormLabel>Engine</FormLabel>
            <Input type='text' placeholder='3.5L V6...' {...register('engine')} />
            <FormErrorMessage>{errors.make?.message}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <FormLabel>VIN (Vehicle Identification Number)</FormLabel>
            <Input type='text' {...register('vin')} />
            <FormErrorMessage>{errors.make?.message}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <FormLabel>License Plate</FormLabel>
            <Input type='text' {...register('licensePlate')} />
            <FormErrorMessage>{errors.make?.message}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <FormLabel>Odometer (miles)</FormLabel>
            <Input type='number' {...register('miles')} />
            <FormErrorMessage>{errors.make?.message}</FormErrorMessage>
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

          <ModalFooter>
            <Button onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type='submit' variant='contained'>
              Add
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddVehicle;
