import React, { useState } from 'react';
import { IBudget, Transaction } from 'models/types';
import AddTransaction from 'components/Forms/AddTransaction';
import { useUserStore } from 'state/UserStore';
import { useFirestoreDocumentMutation } from '@react-query-firebase/firestore';
import { doc } from 'firebase/firestore';
import { db, FsCol } from '../../firebase';
import { MdAdd, MdDelete } from 'react-icons/md';
import { Box, Button, Stack, Text } from '@chakra-ui/react';

// TODO: Data grid

const dgColumns = [
  {
    field: 'amt',
    headerName: 'Amount',
    minWidth: 65,
    type: 'number',
    flex: 1,
    editable: true,
    valueFormatter: (params: { value?: number }) => {
      if (!params.value) return '';
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
    valueGetter: (params: { value?: string }) => new Date(params.value ?? ''),
  },
];

interface TransactionsProps {
  budget: IBudget;
}

const Transactions = ({ budget }: TransactionsProps): JSX.Element => {
  const family = useUserStore((state) => state.family);

  const [addingTransaction, setAddingTransaction] = useState(false);
  const [selection, setSelection] = useState<GridRowId[]>([]);
  const [pageSize, setPageSize] = useState(20);

  const budgetDocMutation = useFirestoreDocumentMutation(doc(db, FsCol.Budgets, family?.budgetId ?? 'undefined'), {
    merge: true,
  });

  const removeTransactions = () => {
    if (!family?.budgetId) return;

    let updArr = [...budget.transactions];

    updArr = updArr.filter((_val, idx) => selection.indexOf(idx) === -1); // Efficient way to remove transaction(s) from array

    budgetDocMutation.mutate({ transactions: updArr });
    setSelection([]);
  };

  const processTransactionUpdate = (newRow: Transaction, oldRow: Transaction) => {
    if (!family?.budgetId) return oldRow;

    newRow.timestamp = newRow.timestamp.toString();
    const updArr = [...budget.transactions];
    updArr[updArr.findIndex((transaction) => transaction.id === oldRow.id)] = newRow;

    budgetDocMutation.mutate({ transactions: updArr });

    return newRow;
  };

  return (
    <Box mt={2} ml={1} mr={1}>
      <Text variant='h3' mb={2}>
        Transactions
      </Text>
      <Button leftIcon={<MdAdd />} variant='contained' onClick={() => setAddingTransaction(true)}>
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
        <Button leftIcon={<MdDelete />} variant='contained' color='error' onClick={removeTransactions} sx={{ mb: 3 }}>
          Remove transaction{selection.length > 1 && 's'}
        </Button>
      )}

      <AddTransaction isOpen={addingTransaction} setIsOpen={setAddingTransaction} budget={budget} />
    </Box>
  );
};

export default Transactions;
