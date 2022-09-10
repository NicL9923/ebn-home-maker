import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { BudgetCategory, BudgetSubcategory, Transaction } from 'models/types';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';

const catSubcatKeySeparator = '&%&';

interface AddTransactionProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  saveNewTransaction: (newTransaction: Transaction) => void;
  budgetCats: BudgetCategory[];
}

const AddTransaction = (props: AddTransactionProps) => {
  const { isOpen, setIsOpen, saveNewTransaction, budgetCats } = props;
  const [newTransactionName, setNewTransactionName] = useState('');
  const [newTransactionAmt, setNewTransactionAmt] = useState('');
  const [newTransactionCat, setNewTransactionCat] = useState('');
  const [newTransactionDate, setNewTransactionDate] = useState<Date | undefined | null>(new Date());

  const getCatSelectList = (): JSX.Element[] => {
    const catSelectArr: JSX.Element[] = [];

    budgetCats.forEach((category: BudgetCategory) => {
      catSelectArr.push(<ListSubheader key={category.name}>{category.name}</ListSubheader>);

      category.subcategories.forEach((subcat: BudgetSubcategory) => {
        catSelectArr.push(
          <MenuItem
            key={`${category.name}${catSubcatKeySeparator}${subcat.name}`}
            value={`${category.name}${catSubcatKeySeparator}${subcat.name}`}
          >
            {subcat.name}
          </MenuItem>
        );
      });
    });

    return catSelectArr;
  };

  const submitNewTransaction = () => {
    if (!newTransactionDate) {
      return;
    }

    const splitCats = newTransactionCat.split(catSubcatKeySeparator);

    const formattedTransaction: Transaction = {
      amt: parseFloat(newTransactionAmt),
      name: newTransactionName,
      timestamp: newTransactionDate.toString(),
      category: splitCats[0],
      subcategory: splitCats[1],
    };

    saveNewTransaction(formattedTransaction);

    setIsOpen(false);
    setNewTransactionName('');
    setNewTransactionAmt('');
    setNewTransactionCat('');
    setNewTransactionDate(new Date());
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

          <FormControl variant='standard' sx={{ mt: 2, mb: 2 }}>
            <InputLabel id='selectLbl'>Category</InputLabel>
            <Select
              labelId='selectLbl'
              value={newTransactionCat !== undefined ? newTransactionCat.split('-')[1] : ''}
              onChange={(event) => setNewTransactionCat(event.target.value)}
            >
              {getCatSelectList()}
            </Select>
          </FormControl>

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
