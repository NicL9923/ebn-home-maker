import React from 'react';
import { IBudget, Transaction } from 'models/types';
import { useUserStore } from 'state/UserStore';
import { useFirestoreDocumentMutation } from '@react-query-firebase/firestore';
import { doc } from 'firebase/firestore';
import { db, FsCol } from '../../firebase';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

// TODO: Date picker

export const catSubcatKeySeparator = '&%&';

const convertConcatToCatOpt = (concatCats: string) => {
  const splitCats = concatCats.split(catSubcatKeySeparator);

  return {
    category: splitCats[0],
    subcategory: splitCats[1],
  };
};

interface ICatOpt {
  category: string;
  subcategory: string;
}

interface AddTransactionProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  initialCatSubcat?: string;
  budget: IBudget;
}

const AddTransaction = ({ isOpen, setIsOpen, initialCatSubcat, budget }: AddTransactionProps) => {
  const toast = useToast();
  const family = useUserStore((state) => state.family);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const budgetDocMutation = useFirestoreDocumentMutation(doc(db, FsCol.Budgets, family?.budgetId ?? 'undefined'), {
    merge: true,
  });

  const getCatOptions = () => {
    const catOptions: ICatOpt[] = [];

    budget.categories.forEach((category) => {
      category.subcategories.forEach((subcat) => {
        catOptions.push({
          category: category.name,
          subcategory: subcat.name,
        });
      });
    });

    return catOptions;
  };

  const submitNewTransaction = () => {
    if (!family?.budgetId || !newTransactionDate) {
      return;
    }

    const formattedTransaction: Transaction = {
      amt: parseFloat(newTransactionAmt),
      name: newTransactionName,
      timestamp: newTransactionDate.toString(),
      category: '',
      subcategory: '',
    };

    if (initialCatSubcat) {
      const catOpt = convertConcatToCatOpt(initialCatSubcat);

      formattedTransaction.category = catOpt.category;
      formattedTransaction.subcategory = catOpt.subcategory;
    } else if (newTransactionCat) {
      formattedTransaction.category = newTransactionCat.category;
      formattedTransaction.subcategory = newTransactionCat.subcategory;
    }

    const updArr = [...budget.transactions, formattedTransaction];

    budgetDocMutation.mutate(
      { transactions: updArr },
      {
        onSuccess() {
          toast({
            title: 'Successfully added transaction!',
            status: 'success',
            isClosable: true,
          });

          setIsOpen(false);
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Transaction</ModalHeader>

        <Stack>
          <form onSubmit={handleSubmit(submitNewTransaction)}>
            <FormControl>
              <FormLabel>Amount</FormLabel>
              <Input type='number' {...register('amount')} />
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Input type='text' {...register('description')} />
            </FormControl>

            <FormControl>
              <FormLabel>Category</FormLabel>
              {initialCatSubcat ? (
                <Input
                  type='text'
                  defaultValue={convertConcatToCatOpt(initialCatSubcat).subcategory}
                  {...register('category')}
                  sx={{ mt: 2, mb: 2 }}
                />
              ) : (
                <Autocomplete
                  options={getCatOptions()}
                  groupBy={(option) => option.category}
                  getOptionLabel={(option) => option.subcategory}
                  sx={{ mt: 2, mb: 2 }}
                  renderInput={(params) => <Input type='text' {...params} {...register('category')} />}
                />
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Date</FormLabel>
              <Input type='date' defaultValue={new Date().toLocaleDateString()} {...register('date')} />
            </FormControl>
          </form>
        </Stack>

        <ModalFooter>
          <Button onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type='submit' variant='contained' onClick={submitNewTransaction}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddTransaction;
