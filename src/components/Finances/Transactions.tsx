import React, { useContext, useState } from 'react';
import { Add, Delete } from '@mui/icons-material';
import { Button, Stack, Typography, Box } from '@mui/material';
import { DataGrid, GridRowId } from '@mui/x-data-grid';
import { UserContext } from 'providers/AppProvider';
import { FirebaseContext } from 'providers/FirebaseProvider';
import { IBudget, Transaction } from 'models/types';
import AddTransaction from 'components/Forms/AddTransaction';

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
  budget: IBudget;
  getBudget: () => void;
}

const Transactions = (props: TransactionsProps): JSX.Element => {
  const { budget, getBudget } = props;
  const firebase = useContext(FirebaseContext);
  const { family } = useContext(UserContext);
  const [addingTransaction, setAddingTransaction] = useState(false);
  const [selection, setSelection] = useState<GridRowId[]>([]);
  const [pageSize, setPageSize] = useState(20);

  const removeTransactions = () => {
    if (!family?.budgetId) return;

    let updArr = [...budget.transactions];

    updArr = updArr.filter((_val, idx) => selection.indexOf(idx) === -1); // Efficient way to remove transaction(s) from array

    firebase.updateBudget(family.budgetId, { transactions: updArr }).then(() => {
      getBudget();
      setSelection([]);
    });
  };

  const processTransactionUpdate = (newRow: Transaction, oldRow: Transaction) => {
    if (!family?.budgetId) return oldRow;

    newRow.timestamp = newRow.timestamp.toString();
    const updArr = [...budget.transactions];
    updArr[updArr.findIndex((transaction) => transaction.id === oldRow.id)] = newRow;

    firebase.updateBudget(family.budgetId, { transactions: updArr }).then(getBudget);

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
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
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

      <AddTransaction
        isOpen={addingTransaction}
        setIsOpen={setAddingTransaction}
        budget={budget}
        getBudget={getBudget}
      />
    </Box>
  );
};

export default Transactions;
