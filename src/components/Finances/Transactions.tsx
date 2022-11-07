import React, { useState } from 'react';
import { IBudget, Transaction } from 'models/types';
import AddTransaction from 'components/Forms/AddTransaction';
import { useUserStore } from 'state/UserStore';
import { useFirestoreDocumentMutation } from '@react-query-firebase/firestore';
import { doc } from 'firebase/firestore';
import { db, FsCol } from '../../firebase';
import { MdAdd, MdDelete } from 'react-icons/md';
import { Box, Button, Heading, Stack, Text } from '@chakra-ui/react';
import { Column, CompactTable } from '@table-library/react-table-library/compact';
import { usePagination } from '@table-library/react-table-library/pagination';
import { useSort } from '@table-library/react-table-library/sort';
import { useRowSelect } from '@table-library/react-table-library/select';

const transactionTableColumns: Column[] = [
  {
    label: 'Amount',
    renderCell: (item) =>
      `$${item.amt.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
  },
  {
    label: 'Description',
    renderCell: (item) => item.name,
  },
  {
    label: 'Subcategory',
    renderCell: (item) => item.subcategory,
    // TODO: Make a custom (or re-use the existing) edit component for this (same Select/Switch component as Dialog)
  },
  {
    label: 'Date',
    renderCell: (item) =>
      new Date(item.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  },
];

interface PageState {
  page: number;
  size: number;
}

interface TransactionsProps {
  budget: IBudget;
}

const Transactions = ({ budget }: TransactionsProps): JSX.Element => {
  const family = useUserStore((state) => state.family);

  const transactionTableData = {
    nodes: budget.transactions.map((transaction) => ({ ...transaction, id: transaction.id?.toString() ?? '' })),
  };

  const [addingTransaction, setAddingTransaction] = useState(false);
  const [selection, setSelection] = useState<string[]>([]);
  // TODO: rowsPerPageOptions={[10, 20, 50, 100]}
  const [pageState, setPageState] = useState<PageState>({ page: 0, size: 20 });

  const sort = useSort(
    transactionTableData,
    {
      state: {
        sortKey: 'TIMESTAMP',
        reverse: true,
      },
    },
    {
      sortFns: {
        TIMESTAMP: (array) => array.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
      },
    }
  );

  const pagination = usePagination(transactionTableData, {
    state: pageState,
    onChange: (_action, state) => setPageState(state as PageState),
  });

  const select = useRowSelect(transactionTableData, {
    state: {
      ids: selection,
    },
    onChange: (_action, state) => setSelection(state.ids),
  });

  const budgetDocMutation = useFirestoreDocumentMutation(doc(db, FsCol.Budgets, family?.budgetId ?? 'undefined'), {
    merge: true,
  });

  const removeTransactions = () => {
    if (!family?.budgetId) return;

    let updArr = [...budget.transactions];

    updArr = updArr.filter((_val, idx) => selection.indexOf(idx.toString()) === -1); // Efficient way to remove transaction(s) from array

    budgetDocMutation.mutate({ transactions: updArr });
    setSelection([]);
  };

  /* TODO: Hook this back up
  const processTransactionUpdate = (newRow: Transaction, oldRow: Transaction) => {
    if (!family?.budgetId) return oldRow;

    newRow.timestamp = newRow.timestamp.toString();
    const updArr = [...budget.transactions];
    updArr[updArr.findIndex((transaction) => transaction.id === oldRow.id)] = newRow;

    budgetDocMutation.mutate({ transactions: updArr });

    return newRow;
  };
  */

  return (
    <Box mt={2} ml={1} mr={1}>
      <Heading mb={2}>Transactions</Heading>
      <Button leftIcon={<MdAdd />} onClick={() => setAddingTransaction(true)}>
        Add transaction
      </Button>
      <Stack height={500} mt={3} mb={2}>
        <CompactTable
          columns={transactionTableColumns}
          data={transactionTableData}
          pagination={pagination}
          sort={sort}
          select={select}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Total Pages: {pagination.state.getTotalPages(transactionTableData.nodes)}</span>

          <span>
            Page:{' '}
            {pagination.state.getPages(transactionTableData.nodes).map((_: any, pageIndex: any) => (
              <button
                key={pageIndex}
                type='button'
                style={{
                  fontWeight: pagination.state.page === pageIndex ? 'bold' : 'normal',
                }}
                onClick={() => pagination.fns.onSetPage(pageIndex)}
              >
                {pageIndex + 1}
              </button>
            ))}
          </span>
        </div>
      </Stack>

      {selection.length > 0 && (
        <Button leftIcon={<MdDelete />} color='error' onClick={removeTransactions} sx={{ mb: 3 }}>
          Remove transaction{selection.length > 1 && 's'}
        </Button>
      )}

      <AddTransaction isOpen={addingTransaction} setIsOpen={setAddingTransaction} budget={budget} />
    </Box>
  );
};

export default Transactions;
