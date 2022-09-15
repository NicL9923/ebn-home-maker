import React, { useContext, useState } from 'react';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { IBudget, Transaction } from 'models/types';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { FirebaseContext } from '../../Firebase';
import { UserContext } from 'App';

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
  getBudget: () => void;
}

const AddTransaction = (props: AddTransactionProps) => {
  const firebase = useContext(FirebaseContext);
  const { family } = useContext(UserContext);
  const { isOpen, setIsOpen, initialCatSubcat, budget, getBudget } = props;
  const [newTransactionName, setNewTransactionName] = useState('');
  const [newTransactionAmt, setNewTransactionAmt] = useState('');
  const [newTransactionCat, setNewTransactionCat] = useState<ICatOpt | undefined>(undefined);
  const [catInputValue, setCatInputValue] = useState('');
  const [newTransactionDate, setNewTransactionDate] = useState<Date | undefined | null>(new Date());

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

    firebase.updateBudget(family.budgetId, { transactions: updArr }).then(() => {
      getBudget();

      setIsOpen(false);
      setNewTransactionName('');
      setNewTransactionAmt('');
      setNewTransactionCat(undefined);
      setNewTransactionDate(new Date());
    });
  };

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} fullWidth>
      <DialogTitle>Add Transaction</DialogTitle>

      <DialogContent>
        <Stack>
          <TextField
            autoFocus
            variant='standard'
            label='Amount'
            type='number'
            value={newTransactionAmt}
            onChange={(event) => setNewTransactionAmt(event.target.value)}
          />

          <TextField
            variant='standard'
            label='Description'
            value={newTransactionName}
            onChange={(event) => setNewTransactionName(event.target.value)}
          />

          {initialCatSubcat ? (
            <TextField
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

          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <DatePicker
              label='Date'
              value={newTransactionDate}
              onChange={(newDate: Date | null) => setNewTransactionDate(newDate)}
              renderInput={(params) => <TextField {...params} variant='standard' />}
            />
          </LocalizationProvider>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setIsOpen(false)}>Cancel</Button>
        <Button variant='contained' onClick={submitNewTransaction}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTransaction;
