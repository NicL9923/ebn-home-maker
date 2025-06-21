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
import { BaseSyntheticEvent, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import Client from '../../Client';
import { Pet } from '../../models/types';
import { useUserStore } from '../../state/UserStore';
import { genUuid } from '../../utils/utils';
import FileDropzone from '../Inputs/FileDropzone';

const addOrEditPetSchema = yup.object({
    name: yup.string().required(`Your pet's name is required`),
    photo: yup.mixed<File>(),
});

type AddOrEditPetFormSchema = yup.InferType<typeof addOrEditPetSchema>;

interface AddOrEditPetProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    existingPet?: Pet;
}

const AddOrEditPet = (props: AddOrEditPetProps) => {
    const { isOpen, setIsOpen, existingPet } = props;

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
        resolver: yupResolver(addOrEditPetSchema),
    });

    const [isAddingOrEditingPet, setIsAddingOrEditingPet] = useState(false);

    const addOrEditPet = async (newPetData: AddOrEditPetFormSchema, event?: BaseSyntheticEvent) => {
        event?.preventDefault();
        if (!profile || !family) return;

        setIsAddingOrEditingPet(true);

        const newPetsArr = family.pets ? [...family.pets] : [];

        const { name, photo } = newPetData;
        const imgLink = photo ? await Client.uploadImageAndGetUrl(photo) : undefined;
        const newPet: Pet = {
            uid: existingPet?.uid ?? genUuid(),
            name,
        };

        if (imgLink) {
            newPet.imgLink = imgLink;
        }

        if (existingPet) {
            const existingPetIndex = newPetsArr.findIndex((pet) => pet.uid === existingPet.uid);
            newPetsArr[existingPetIndex] = newPet;
        } else {
            newPetsArr.push(newPet);
        }

        await Client.updateFamily(profile.familyId, { pets: newPetsArr });

        toast({
            title: `Successfully ${existingPet ? 'edited' : 'added'} pet!`,
            status: 'success',
            isClosable: true,
        });

        setIsOpen(false);
        setIsAddingOrEditingPet(false);
        reset();
    };

    useEffect(() => {
        reset({ name: existingPet?.name ?? '' });
    }, [existingPet]);

    return (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{existingPet ? 'Edit' : 'Add'} pet</ModalHeader>

                <form onSubmit={handleSubmit(addOrEditPet)} method='post'>
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
                                render={({ field }) => <FileDropzone file={field.value} setFile={field.onChange} />}
                            />
                            <FormErrorMessage>{errors.photo?.message}</FormErrorMessage>
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button type='button' onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button type='submit' ml={3} colorScheme='green' isLoading={isAddingOrEditingPet}>
                            Save
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};

export default AddOrEditPet;
