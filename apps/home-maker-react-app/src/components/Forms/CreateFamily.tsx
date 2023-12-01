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
  useToast,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { doc, writeBatch } from 'firebase/firestore';
import { BaseSyntheticEvent, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { FsCol, db } from '../../firebase';
import { Family } from '../../models/types';
import { useUserStore } from '../../state/UserStore';
import { genUuid } from '../../utils/utils';

const createFamilySchema = yup
  .object({
    name: yup.string().required(`A name is required for your family`),
  })
  .required();

interface CreateFamilyFormSchema {
  name: string;
}

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
  } = useForm<CreateFamilyFormSchema>({
    resolver: yupResolver(createFamilySchema),
  });

  const batch = writeBatch(db);

  const [isCreatingFamily, setIsCreatingFamily] = useState(false);

  const createFamily = (createFamilyData: CreateFamilyFormSchema, event?: BaseSyntheticEvent) => {
    event?.preventDefault();
    if (!userId) return;

    setIsCreatingFamily(true);

    const newFamId = genUuid();
    const newFamObj: Family = {
      uid: newFamId,
      name: createFamilyData.name,
      headOfFamily: userId,
      members: [userId],
      boardMarkdown: 'This is the family board!',
      pets: [],
      vehicles: [],
      residences: [],
      groceryList: [],
      cityState: 'Seattle,WA', // This'll be the default, because why not!
      settings: {
        showAllTransactionsOnCurrentMonth: false,
      },
    };

    batch.set(doc(db, FsCol.Families, newFamId), newFamObj);
    batch.update(doc(db, FsCol.Profiles, userId), { familyId: newFamId });

    batch.commit().then(() => {
      toast({
        title: 'Successfully created family!',
        status: 'success',
        isClosable: true,
      });

      setIsOpen(false);
      setIsCreatingFamily(false);
      reset();
    });
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
            <Button type='submit' ml={3} colorScheme='green' disabled={isCreatingFamily}>
              {isCreatingFamily ? <Spinner /> : 'Create'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CreateFamily;
