import React, { BaseSyntheticEvent, useMemo } from 'react';
import { IBudget, Transaction } from 'models/types';
import { useUserStore } from 'state/UserStore';
import { doc, updateDoc } from 'firebase/firestore';
import { db, FsCol } from '../../firebase';
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
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Select, OptionBase, GroupBase } from 'chakra-react-select';
import DatePicker from 'components/Inputs/DatePicker';

// TODO: Disable form buttons while submitting
// TODO: Add calculate functionality to the amount field here too

export const catSubcatKeySeparator = '&%&';

const addTransactionSchema = yup
  .object({
    amount: yup.number().required('The transaction amount is required'),
    description: yup.string().required('A description of the transaction is required'),
    catSubcat: yup.mixed().required('The (sub)category that the transaction falls under is required'),
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
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddTransactionFormSchema>({
    resolver: yupResolver(addTransactionSchema),
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

  const initialCatSubcatOption = useMemo<ICatOpt | undefined>(() => {
    let newInitialOption: ICatOpt | undefined = undefined;

    categoryOptions.forEach((optGroup) => {
      const foundOpt = optGroup.options.find((opt) => opt.value === initialCatSubcat);

      if (foundOpt) {
        newInitialOption = { ...foundOpt };
      }
    });

    if (newInitialOption) {
      setValue('catSubcat', newInitialOption);
    }

    return newInitialOption;
  }, [categoryOptions, initialCatSubcat]);

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

    updateDoc(doc(db, FsCol.Budgets, family.budgetId), { transactions: updArr }).then(() => {
      toast({
        title: 'Successfully added transaction!',
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
        <ModalHeader>Add Transaction</ModalHeader>

        <form onSubmit={handleSubmit(submitNewTransaction)} method='post'>
          <ModalBody>
            <FormControl isInvalid={!!errors.amount?.message}>
              <FormLabel>Amount</FormLabel>
              <Input type='number' {...register('amount')} step='0.01' />
              <FormErrorMessage>{errors.amount?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.description?.message}>
              <FormLabel>Description</FormLabel>
              <Input type='text' {...register('description')} />
              <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.catSubcat?.message}>
              <FormLabel>Category</FormLabel>
              <Controller
                name='catSubcat'
                control={control}
                defaultValue={initialCatSubcatOption}
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

            <FormControl isInvalid={!!errors.date?.message}>
              <FormLabel>Date</FormLabel>
              <Controller
                name='date'
                control={control}
                defaultValue={new Date()}
                render={({ field }) => <DatePicker selected={field.value} onChange={field.onChange} />}
              />
              <FormErrorMessage>{errors.date?.message}</FormErrorMessage>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button type='button' onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type='submit' colorScheme='green' ml={3}>
              Save
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddTransaction;
