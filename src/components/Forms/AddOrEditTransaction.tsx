import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { GroupBase, OptionBase, Select } from 'chakra-react-select';
import { BaseSyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { MdCalculate } from 'react-icons/md';
import * as yup from 'yup';
import Client from '../../Client';
import { IBudget, Transaction } from '../../models/types';
import {
  evaluateExprAndRoundTo2Decimals,
  genUuid,
  getCombinedCategoryString,
  getMonetaryValue2DecimalString,
  roundTo2Decimals,
} from '../../utils/utils';
import DatePicker from '../Inputs/DatePicker';

export const catSubcatKeySeparator = '&%&';

interface IGroupOpt extends GroupBase<ICatOpt> {
  label: string;
  options: ICatOpt[];
}

interface ICatOpt extends OptionBase {
  /** Subcategory */
  label: string;
  /** category<separator>subcategory */
  value: string;
}

const addOrEditTransactionSchema = yup
  .object({
    amount: yup.number().required('The transaction amount is required'),
    description: yup.string().required('A description of the transaction is required'),
    catSubcat: yup.mixed<ICatOpt>().required('The (sub)category that the transaction falls under is required'),
    date: yup.date().required('The date of the transaction is required'),
  });

type AddOrEditTransactionFormSchema = yup.InferType<typeof addOrEditTransactionSchema>;

interface AddOrEditTransactionProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  initialCatSubcat?: string;
  budget: IBudget;
  existingTransaction?: Transaction;
}

const AddOrEditTransaction = (props: AddOrEditTransactionProps) => {
  const { isOpen, setIsOpen, initialCatSubcat, budget, existingTransaction } = props;

  const toast = useToast();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddOrEditTransactionFormSchema>({
    resolver: yupResolver(addOrEditTransactionSchema),
    defaultValues: {
      amount: 0,
      description: '',
      catSubcat: undefined,
      date: new Date(),
    },
  });

  const [amtStr, setAmtStr] = useState('');
  const [isAddingOrEditingTransaction, setIsAddingOrEditingTransaction] = useState(false);

  const categoryOptions = useMemo(() => {
    const catOptions: IGroupOpt[] = budget.categories.map((category) => ({
      label: category.name,
      options: category.subcategories.map((subcategory) => ({
        label: subcategory.name,
        value: getCombinedCategoryString(category.name, subcategory.name),
      })),
    }));

    return catOptions;
  }, [budget]);

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
  }, [categoryOptions, initialCatSubcat, setValue]);

  const resetToDefaultEmptyForm = useCallback(() => {
    reset({
      amount: 0,
      description: '',
      catSubcat: initialCatSubcatOption ?? {},
      date: new Date(),
    });
  }, [reset, initialCatSubcatOption]);

  const submitNewTransaction = async (transactionData: AddOrEditTransactionFormSchema, event?: BaseSyntheticEvent) => {
    event?.preventDefault();

    setIsAddingOrEditingTransaction(true);

    const splitCatSubcat = transactionData.catSubcat.value.split(catSubcatKeySeparator);

    const formattedTransaction: Transaction = {
      uid: existingTransaction?.uid ?? genUuid(),
      amt: transactionData.amount,
      name: transactionData.description,
      timestamp: transactionData.date.toString(),
      category: splitCatSubcat[0],
      subcategory: splitCatSubcat[1],
    };

    const updArr = [...budget.transactions];

    if (existingTransaction) {
      const existingTransactionIndex = updArr.findIndex((transaction) => transaction.uid === existingTransaction.uid);
      updArr[existingTransactionIndex] = formattedTransaction;
    } else {
      updArr.push(formattedTransaction);
    }

    await Client.updateBudget(budget.uid, { transactions: updArr })

    toast({
      title: 'Successfully added transaction!',
      status: 'success',
      isClosable: true,
    });

    setIsOpen(false);
    setIsAddingOrEditingTransaction(false);
    resetToDefaultEmptyForm();
    setAmtStr('');
  };

  const calculateMoneyValue = () => {
    const newVal = evaluateExprAndRoundTo2Decimals(amtStr);
    setValue('amount', newVal);
    setAmtStr(getMonetaryValue2DecimalString(newVal));
  };

  useEffect(() => {
    if (existingTransaction) {
      reset({
        amount: existingTransaction.amt,
        description: existingTransaction.name,
        catSubcat: {
          label: existingTransaction.subcategory,
          value: getCombinedCategoryString(existingTransaction.category, existingTransaction.subcategory),
        },
        date: new Date(existingTransaction.timestamp),
      });
      setAmtStr(getMonetaryValue2DecimalString(existingTransaction.amt));
    } else {
      resetToDefaultEmptyForm();
      setAmtStr('');
    }
  }, [existingTransaction, resetToDefaultEmptyForm, reset]);

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{!!existingTransaction ? 'Edit' : 'Add'} transaction</ModalHeader>

        <form onSubmit={handleSubmit(submitNewTransaction)} method='post'>
          <ModalBody>
            <FormControl isInvalid={!!errors.amount?.message}>
              <FormLabel>Amount</FormLabel>

              <Stack direction='row' alignItems='center' spacing={1}>
                <Controller
                  name='amount'
                  control={control}
                  render={({ field }) => (
                    <InputGroup>
                      <InputLeftElement>$</InputLeftElement>
                      <Input
                        type='text'
                        value={amtStr}
                        onChange={(e) => {
                          field.onChange(roundTo2Decimals(parseFloat(e.target.value)));
                          setAmtStr(e.target.value);
                        }}
                      />
                    </InputGroup>
                  )}
                />
                <Tooltip title='Calculate value'>
                  <IconButton
                    icon={<MdCalculate />}
                    onClick={calculateMoneyValue}
                    variant='ghost'
                    fontSize='32'
                    aria-label='Calculate expression value'
                  />
                </Tooltip>
              </Stack>

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
                render={({ field }) => <DatePicker selected={field.value} onChange={field.onChange} />}
              />
              <FormErrorMessage>{errors.date?.message}</FormErrorMessage>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button type='button' onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type='submit' colorScheme='green' ml={3} isLoading={isAddingOrEditingTransaction}>
              Save
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddOrEditTransaction;
