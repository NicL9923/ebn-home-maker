import React, { useContext, useState } from 'react';
import { Add, Delete } from '@mui/icons-material';
import {
  Button,
  Stack,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Select,
  ListSubheader,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { DataGrid, GridRowId } from '@mui/x-data-grid';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { UserContext } from '../App';
import { FirebaseContext } from '../Firebase';
import { BudgetCategory, BudgetIF, BudgetSubcategory, Transaction } from 'models/types';

const dgColumns = [
  {
    field: 'amt',
    headerName: 'Amount',
    minWidth: 65,
    type: 'number',
    flex: 1,
    editable: true,
    valueFormatter: (params: any) => {
      if (params.value === null) return '';
      return `$${params.value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
  },
  {
    field: 'name',
    headerName: 'Description',
    minWidth: 120,
    flex: 1,
    editable: true,
  },
  {
    field: 'subcategory',
    headerName: 'Subcategory',
    minWidth: 90,
    flex: 1,
    // editable: true, TODO: Make a custom edit component for this (same Select/Switch component as Dialog)
  },
  {
    field: 'timestamp',
    headerName: 'Date',
    type: 'date',
    flex: 1,
    width: 100,
    editable: true,
    valueGetter: (params: any) => new Date(params.value),
  },
];

interface TransactionsProps {
  budget: BudgetIF;
  getBudget: () => void;
}

const Transactions = (props: TransactionsProps): JSX.Element => {
  const { budget, getBudget } = props;
  const firebase = useContext(FirebaseContext);
  const { profile } = useContext(UserContext);
  const [addingTransaction, setAddingTransaction] = useState(false);
  const [newTransactionName, setNewTransactionName] = useState(''); // TODO: combine newTransaction into single state object
  const [newTransactionAmt, setNewTransactionAmt] = useState('');
  const [newTransactionCat, setNewTransactionCat] = useState('');
  const [newTransactionDate, setNewTransactionDate] = useState<Date | undefined | null>(new Date());
  const [selection, setSelection] = useState<GridRowId[]>([]);

  const saveNewTransaction = () => {
    if (
      !newTransactionName ||
      !newTransactionAmt ||
      !newTransactionCat ||
      !newTransactionDate ||
      !profile ||
      !profile.budgetId
    ) {
      console.error(
        `One or more values are null/undefined: ${newTransactionName}, ${newTransactionAmt}, ${newTransactionCat}, ${newTransactionDate}, ${profile}`
      );
      return;
    }

    const updArr: any[] = Array.from(budget.transactions);
    const splitCats = newTransactionCat.split('-');

    updArr.push({
      amt: parseFloat(newTransactionAmt),
      name: newTransactionName,
      timestamp: newTransactionDate.toString(),
      category: splitCats[0],
      subcategory: splitCats[1],
    });

    firebase.updateBudget(profile.budgetId, { transactions: updArr }).then(() => {
      getBudget();
      setAddingTransaction(false);
      setNewTransactionName('');
      setNewTransactionAmt('');
      setNewTransactionCat('');
      setNewTransactionDate(new Date());
    });
  };

  const removeTransactions = () => {
    if (!profile || !profile.budgetId) return;

    let updArr = [...budget.transactions];

    updArr = updArr.filter((val, idx) => selection.indexOf(idx) === -1); // Efficient way to remove transaction(s) from array

    firebase.updateBudget(profile.budgetId, { transactions: updArr }).then(() => {
      getBudget();
      setSelection([]);
    });
  };

  const getCatSelectList = (): JSX.Element[] => {
    const catSelectArr: JSX.Element[] = [];

    budget.categories.forEach((category: BudgetCategory) => {
      catSelectArr.push(<ListSubheader key={category.name}>{category.name}</ListSubheader>);

      category.subcategories.forEach((subcat: BudgetSubcategory) => {
        catSelectArr.push(
          <MenuItem key={`${category.name}-${subcat.name}`} value={`${category.name}-${subcat.name}`}>
            {subcat.name}
          </MenuItem>
        );
      });
    });

    return catSelectArr;
  };

  const processTransactionUpdate = (newRow: Transaction, oldRow: Transaction) => {
    if (!profile || !profile.budgetId) return oldRow;

    newRow.timestamp = newRow.timestamp.toString();
    const updArr = [...budget.transactions];
    updArr[updArr.findIndex((transaction) => transaction.id === oldRow.id)] = newRow;

    firebase.updateBudget(profile.budgetId, { transactions: updArr }).then(getBudget);

    return newRow;
  };

  return (
    <Box mt={2} ml={1} mr={1}>
      <Typography variant='h3' mb={2}>
        Transactions
      </Typography>
      <Button startIcon={<Add />} variant='contained' onClick={() => setAddingTransaction(true)}>
        Add transaction
      </Button>
      <Stack height={500} mt={3} mb={2}>
        <DataGrid
          columns={dgColumns}
          rows={budget.transactions}
          pageSize={20}
          rowsPerPageOptions={[10, 20, 50, 100]}
          selectionModel={selection}
          onSelectionModelChange={setSelection}
          experimentalFeatures={{ newEditingApi: true }}
          initialState={{
            sorting: { sortModel: [{ field: 'timestamp', sort: 'desc' }] },
          }}
          processRowUpdate={processTransactionUpdate}
          checkboxSelection
          disableSelectionOnClick
        />
      </Stack>

      {selection.length > 0 && (
        <Button startIcon={<Delete />} variant='contained' color='error' onClick={removeTransactions} sx={{ mb: 3 }}>
          Remove transaction{selection.length > 1 && 's'}
        </Button>
      )}

      <Dialog open={addingTransaction} onClose={() => setAddingTransaction(false)} fullWidth>
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
          <Button onClick={() => setAddingTransaction(false)}>Cancel</Button>
          <Button variant='contained' onClick={saveNewTransaction}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Transactions;
