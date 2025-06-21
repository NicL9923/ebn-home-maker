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
import { BaseSyntheticEvent, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import Client from '../../Client';
import { getNewFamilyTemplate } from '../../constants';
import { useUserStore } from '../../state/UserStore';

const createFamilySchema = yup.object({
    name: yup.string().required(`A name is required for your family`),
});

type CreateFamilyFormSchema = yup.InferType<typeof createFamilySchema>;

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
    } = useForm({
        resolver: yupResolver(createFamilySchema),
    });

    const [isCreatingFamily, setIsCreatingFamily] = useState(false);

    const createFamily = async (createFamilyData: CreateFamilyFormSchema, event?: BaseSyntheticEvent) => {
        event?.preventDefault();
        if (!userId) return;

        setIsCreatingFamily(true);

        const newFamilyTemplate = getNewFamilyTemplate(createFamilyData.name, userId);

        await Client.createNewFamily(userId, newFamilyTemplate);

        toast({
            title: 'Successfully created family!',
            status: 'success',
            isClosable: true,
        });

        setIsOpen(false);
        setIsCreatingFamily(false);
        reset();
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
                        <Button type='submit' ml={3} colorScheme='green' isLoading={isCreatingFamily}>
                            Create
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};

export default CreateFamily;
