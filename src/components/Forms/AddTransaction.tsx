import React, { BaseSyntheticEvent, useMemo } from 'react';
import { IBudget, Transaction } from 'models/types';
import { useUserStore } from 'state/UserStore';
import { useFirestoreDocumentMutation } from '@react-query-firebase/firestore';
import { doc } from 'firebase/firestore';
import { db, FsCol } from '../../firebase';
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
import { useForm, Controller } from 'react-hook-form';
import { ReactDatePicker } from 'react-datepicker';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Select, OptionBase, GroupBase } from 'chakra-react-select';

// TODO: Disable form buttons while submitting
// TODO: Dropzone for file (image) inputs ['image/jpeg', 'image/png']

// NOTE/TODO: If DatePicker ever gets reused, it'd probably be worth to write own wrapper for consistency

// TODO: Add calculate functionality to the amount field here too

export const catSubcatKeySeparator = '&%&';

const addTransactionSchema = yup
  .object({
    amount: yup.number().required('The transaction amount is required'),
    description: yup.string().required('A description of the transaction is required'),
    category: yup.mixed().required('The (sub)category that the transaction falls under is required'),
    date: yup.date().required('The date of the transaction is required'),
  })
  .required();

interface IGroupOpt extends GroupBase<ICatOpt> {
  label: string;
  options: ICatOpt[];
}

interface ICatOpt extends OptionBase {
  label: string; // Subcategory
  value: string; // category-subcategory
}

interface AddTransactionFormSchema {
  amount: number;
  description: string;
  catSubcat: ICatOpt;
  date: Date;
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
    control,
    formState: { errors },
  } = useForm<AddTransactionFormSchema>({
    resolver: yupResolver(addTransactionSchema),
  });

  const budgetDocMutation = useFirestoreDocumentMutation(doc(db, FsCol.Budgets, family?.budgetId ?? 'undefined'), {
    merge: true,
  });

  const categoryOptions = useMemo(() => {
    const catOptions: IGroupOpt[] = budget.categories.map((category) => ({
      label: category.name,
      options: category.subcategories.map((subcategory) => ({
        label: subcategory.name,
        value: `${category.name}${catSubcatKeySeparator}${subcategory.name}`,
      })),
    }));

    return catOptions;
  }, []);

  const submitNewTransaction = (newTransactionData: AddTransactionFormSchema, event?: BaseSyntheticEvent) => {
    event?.preventDefault();
    if (!family?.budgetId) {
      return;
    }

    const splitCatSubcat = newTransactionData.catSubcat.value.split(catSubcatKeySeparator);

    const formattedTransaction: Transaction = {
      amt: newTransactionData.amount,
      name: newTransactionData.description,
      timestamp: newTransactionData.date.toString(),
      category: splitCatSubcat[0],
      subcategory: splitCatSubcat[1],
    };

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

        <form onSubmit={handleSubmit(submitNewTransaction)}>
          <FormControl>
            <FormLabel>Amount</FormLabel>
            <Input type='number' {...register('amount')} />
            <FormErrorMessage>{errors.amount?.message}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <FormLabel>Description</FormLabel>
            <Input type='text' {...register('description')} />
            <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <FormLabel>Category</FormLabel>
            <Controller
              name='catSubcat'
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={field.onChange}
                  options={categoryOptions}
                  isClearable
                  isSearchable
                  isReadOnly={!!initialCatSubcat}
                />
              )}
            />
            <FormErrorMessage>{errors.catSubcat?.message}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <FormLabel>Date</FormLabel>
            <Input type='date' defaultValue={new Date().toLocaleDateString()} {...register('date')} />
            <Controller
              name='date'
              control={control}
              render={({ field }) => <ReactDatePicker selected={field.value} onChange={field.onChange} />}
            />
            <FormErrorMessage>{errors.date?.message}</FormErrorMessage>
          </FormControl>

          <ModalFooter>
            <Button onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type='submit' variant='contained'>
              Save
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddTransaction;
