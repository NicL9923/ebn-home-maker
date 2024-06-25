import {
  Button,
  Checkbox,
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
import { doc, updateDoc } from 'firebase/firestore';
import { BaseSyntheticEvent, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { FsCol, db } from '../../firebase';
import { useUserStore } from '../../state/UserStore';
import { genUuid } from '../../utils/utils';
import { catSubcatKeySeparator } from './AddTransaction';

const addGroceryItemSchema = yup
  .object({
    name: yup.string().required(),
    isSectionHeader: yup.boolean().required(),
  });

type AddGroceryItemFormSchema = yup.InferType<typeof addGroceryItemSchema>;

interface AddGroceryItemProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AddGroceryItem = ({ isOpen, setIsOpen }: AddGroceryItemProps) => {
  const toast = useToast();
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(addGroceryItemSchema),
  });

  const [isAddingItem, setIsAddingItem] = useState(false);

  const addGroceryItem = async (addGroceryItemData: AddGroceryItemFormSchema, event?: BaseSyntheticEvent) => {
    event?.preventDefault();
    if (!family || !profile) return;

    const newList = [...family.groceryList];

    // Reuse, reduce, recycle (catSubcatKeySeparator because...why not?)
    newList.push({ uid: `${addGroceryItemData.isSectionHeader ? catSubcatKeySeparator : ''}${genUuid()}`, name: addGroceryItemData.name, isBought: false });

    await updateDoc(doc(db, FsCol.Families, profile.familyId), { groceryList: newList });

    toast({
      title: `Successfully added ${addGroceryItemData.isSectionHeader ? 'section header' : 'item'}!`,
      status: 'success',
      isClosable: true,
    });

    setIsOpen(false);
    setIsAddingItem(false);
    reset();
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add grocery item</ModalHeader>

        <form onSubmit={handleSubmit(addGroceryItem)} method='post'>
          <ModalBody>
            <FormControl isInvalid={!!errors.name?.message}>
              <FormLabel>Item name</FormLabel>
              <Input type='text' {...register('name')} />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.name?.message} mt={4}>
              <FormLabel>Treat as section header</FormLabel>
              <Checkbox size='lg' {...register('isSectionHeader')} />
              <FormErrorMessage>{errors.isSectionHeader?.message}</FormErrorMessage>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button type='button' onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type='submit' ml={3} colorScheme='green' isLoading={isAddingItem}>
              Add
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddGroceryItem;
