import React, { useState } from 'react';
import { IBudget, Transaction } from 'models/types';
import { useUserStore } from 'state/UserStore';
import { useFirestoreDocumentMutation } from '@react-query-firebase/firestore';
import { doc } from 'firebase/firestore';
import { db, FsCol } from '../../firebase';
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  useToast,
} from '@chakra-ui/react';

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

  const [newTransactionName, setNewTransactionName] = useState('');
  const [newTransactionAmt, setNewTransactionAmt] = useState('');
  const [newTransactionCat, setNewTransactionCat] = useState<ICatOpt | undefined>(undefined);
  const [catInputValue, setCatInputValue] = useState('');
  const [newTransactionDate, setNewTransactionDate] = useState<Date | undefined | null>(new Date());

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
          setNewTransactionName('');
          setNewTransactionAmt('');
          setNewTransactionCat(undefined);
          setNewTransactionDate(new Date());
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
          <Input
            autoFocus
            variant='standard'
            label='Amount'
            type='number'
            value={newTransactionAmt}
            onChange={(event) => setNewTransactionAmt(event.target.value)}
          />

          <Input
            type='text'
            variant='standard'
            label='Description'
            value={newTransactionName}
            onChange={(event) => setNewTransactionName(event.target.value)}
          />

          {initialCatSubcat ? (
            <Input
              type='text'
              variant='standard'
              label='Category'
              value={convertConcatToCatOpt(initialCatSubcat).subcategory}
              InputProps={{
                readOnly: true,
              }}
              sx={{ mt: 2, mb: 2 }}
            />
          ) : (
            <Autocomplete
              options={getCatOptions()}
              groupBy={(option) => option.category}
              getOptionLabel={(option) => option.subcategory}
              value={newTransactionCat}
              onChange={(_e, newValue) => setNewTransactionCat(newValue ?? undefined)}
              inputValue={catInputValue}
              onInputChange={(_event, newValue) => setCatInputValue(newValue)}
              sx={{ mt: 2, mb: 2 }}
              renderInput={(params) => <TextField {...params} label='Category' variant='standard' />}
            />
          )}

          <DatePicker
            label='Date'
            value={newTransactionDate}
            onChange={(newDate: Date | null) => setNewTransactionDate(newDate)}
            renderInput={(params) => <TextField {...params} variant='standard' />}
          />
        </Stack>

        <ModalFooter>
          <Button onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button variant='contained' onClick={submitNewTransaction}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddTransaction;
