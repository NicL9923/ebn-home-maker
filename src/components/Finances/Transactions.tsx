import React, { useMemo, useState } from 'react';
import { IBudget, Transaction } from 'models/types';
import AddTransaction from 'components/Forms/AddTransaction';
import { useUserStore } from 'state/UserStore';
import { doc, updateDoc } from 'firebase/firestore';
import { db, FsCol } from '../../firebase';
import { MdAdd, MdDelete } from 'react-icons/md';
import { Box, Button, Checkbox, Heading, Stack, Table, Tbody, Th, Thead, Tr } from '@chakra-ui/react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  useReactTable,
} from '@tanstack/react-table';

const rowsPerPageOptions = [10, 25, 50, 100];

interface TableTransaction extends Omit<Transaction, 'timestamp'> {
  timestamp: Date;
}

interface TransactionsProps {
  budget: IBudget;
}

const Transactions = ({ budget }: TransactionsProps) => {
  const family = useUserStore((state) => state.family);

  const [addingTransaction, setAddingTransaction] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  // TODO: editable fields

  const transactionColumns = useMemo<ColumnDef<TableTransaction>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            isChecked={table.getIsAllRowsSelected()}
            isIndeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <div>
            <Checkbox
              isChecked={row.getIsSelected()}
              //isIndeterminate={row.getIsSomeSelected()}
              onChange={row.getToggleSelectedHandler()}
            />
          </div>
        ),
      },
      {
        accessorKey: 'amt',
        header: 'Amount',
        cell: (info) =>
          `$${info.getValue<number>().toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
      },
      {
        accessorKey: 'name',
        header: 'Description',
        cell: (info) => info.getValue<string>(),
      },
      {
        accessorKey: 'subcategory',
        header: 'Subcategory',
        cell: (info) => info.getValue<string>(),
        // TODO: Make a custom (or re-use the existing) edit component for this (same Select/Switch component as Dialog)
      },
      {
        accessorKey: 'timestamp',
        header: 'Date',
        cell: (info) =>
          info.getValue<Date>().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
      },
    ],
    []
  );

  const transactionData = useMemo<TableTransaction[]>(
    () => budget.transactions.map((t) => ({ ...t, timestamp: new Date(t.timestamp) })),
    [budget.transactions]
  );

  const table = useReactTable({
    columns: transactionColumns,
    data: transactionData,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: rowsPerPageOptions[0],
      },
      sorting: [{ id: 'timestamp', desc: true }],
    },
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const removeTransactions = () => {
    if (!family?.budgetId) return;

    if (!window.confirm('Are you sure you want to delete the selected transactions?')) return;

    let updArr = [...budget.transactions];

    updArr = updArr.filter((_val, idx) => !rowSelection[idx]);

    updateDoc(doc(db, FsCol.Budgets, family.budgetId), { transactions: updArr }).then(() => {
      setRowSelection({});
    });
  };

  /* TODO: Hook this back up
  const processTransactionUpdate = (newRow: Transaction, oldRow: Transaction) => {
    if (!family?.budgetId) return oldRow;

    newRow.timestamp = newRow.timestamp.toString();
    const updArr = [...budget.transactions];
    updArr[updArr.findIndex((transaction) => transaction.id === oldRow.id)] = newRow;

    updateDoc(doc(db, FsCol.Budgets, family.budgetId), { transactions: updArr })

    return newRow;
  };
  */

  return (
    <Box mt={2} ml={1} mr={1}>
      <Heading mb={2}>Transactions</Heading>

      <Stack direction='row' mb={2} justifyContent='center'>
        <Button leftIcon={<MdAdd />} onClick={() => setAddingTransaction(true)}>
          Add transaction
        </Button>

        <Button
          leftIcon={<MdDelete />}
          onClick={removeTransactions}
          colorScheme='red'
          display={Object.keys(rowSelection).length > 0 ? undefined : 'none'}
        >
          Remove transaction{Object.keys(rowSelection).length > 1 && 's'}
        </Button>
      </Stack>

      <Stack mt={3} mb={2}>
        <Table>
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Th key={header.id} colSpan={header.colSpan}>
                    {!header.isPlaceholder && (
                      <div
                        className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: ' (by Farthest)',
                          desc: ' (by Nearest)',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>

          <Tbody>
            {table.getRowModel().rows.map((row) => (
              <Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>

        <Box>
          <Button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
            {'<<'}
          </Button>

          <Button onClick={table.previousPage} disabled={!table.getCanPreviousPage()}>
            {'<'}
          </Button>

          <Button onClick={table.nextPage} disabled={!table.getCanNextPage()}>
            {'>'}
          </Button>

          <Button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
            {'>>'}
          </Button>

          <span>
            <div>Page</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </strong>
          </span>

          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
          >
            {rowsPerPageOptions.map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </Box>
      </Stack>

      <AddTransaction isOpen={addingTransaction} setIsOpen={setAddingTransaction} budget={budget} />
    </Box>
  );
};

export default Transactions;
