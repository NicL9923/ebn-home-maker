import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Select,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import {
  ColumnDef,
  RowSelectionState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { doc, updateDoc } from 'firebase/firestore';
import { useMemo, useRef, useState } from 'react';
import { HiChevronDoubleLeft, HiChevronDoubleRight, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { MdAdd, MdDelete } from 'react-icons/md';
import { FsCol, db } from '../../firebase';
import { IBudget, Transaction } from '../../models/types';
import { useUserStore } from '../../state/UserStore';
import AddTransaction from '../Forms/AddTransaction';

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
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const cancelRef = useRef(null);

  const transactionColumns = useMemo<ColumnDef<TableTransaction>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            isChecked={table.getIsAllRowsSelected()}
            isIndeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            colorScheme='green'
            borderColor='white'
          />
        ),
        cell: ({ row }) => (
          <div>
            <Checkbox
              isChecked={row.getIsSelected()}
              //isIndeterminate={row.getIsSomeSelected()}
              onChange={row.getToggleSelectedHandler()}
              m={2}
              colorScheme='green'
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

  const removeTransactions = async () => {
    if (!family?.budgetId) return;

    let updArr = [...budget.transactions];

    updArr = updArr.filter((_val, idx) => !rowSelection[idx]);

    await updateDoc(doc(db, FsCol.Budgets, family.budgetId), { transactions: updArr });

    setRowSelection({});
  };

  /* TODO: Hook this back up
  const processTransactionUpdate = (newRow: Transaction, oldRow: Transaction) => {
    if (!family?.budgetId) return oldRow;

    newRow.timestamp = newRow.timestamp.toString();
    const updArr = [...budget.transactions];
    updArr[updArr.findIndex((transaction) => transaction.uid === oldRow.id)] = newRow;

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
          onClick={() => setIsConfirmingDelete(true)}
          colorScheme='red'
          display={Object.keys(rowSelection).length > 0 ? undefined : 'none'}
        >
          Remove transaction{Object.keys(rowSelection).length > 1 && 's'}
        </Button>
      </Stack>

      <Stack mt={3} mb={2}>
        <TableContainer maxHeight='70vh' overflowX='auto' overflowY='auto'>
          <Table variant='striped'>
            <Thead position='sticky' top={0} bgColor='green.400' zIndex={1}>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th key={header.id} colSpan={header.colSpan} color='white'>
                      {!header.isPlaceholder && (
                        <div
                          className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: ' (Oldest)',
                            desc: ' (Newest)',
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
        </TableContainer>

        <Box>
          <Text mt={2}>Total transactions: {transactionData.length}</Text>

          <Stack direction='row' justifyContent='center' alignItems='center' m={2}>
            <IconButton
              icon={<HiChevronDoubleLeft />}
              aria-label='First page'
              onClick={() => table.setPageIndex(0)}
              isDisabled={!table.getCanPreviousPage()}
              fontSize={20}
            />

            <IconButton
              icon={<HiChevronLeft />}
              aria-label='Previous page'
              onClick={table.previousPage}
              isDisabled={!table.getCanPreviousPage()}
              fontSize={20}
            />

            <Text>
              Page{' '}
              <Text fontWeight='bold' display='inline'>
                {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </Text>
            </Text>

            <IconButton
              icon={<HiChevronRight />}
              aria-label='Next page'
              onClick={table.nextPage}
              isDisabled={!table.getCanNextPage()}
              fontSize={20}
            />

            <IconButton
              icon={<HiChevronDoubleRight />}
              aria-label='Last page'
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              isDisabled={!table.getCanNextPage()}
              fontSize={20}
            />
          </Stack>

          <FormControl width='200px'>
            <FormLabel>Rows per page</FormLabel>
            <Select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {rowsPerPageOptions.map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Stack>

      <AddTransaction isOpen={addingTransaction} setIsOpen={setAddingTransaction} budget={budget} />

      <AlertDialog
        isOpen={isConfirmingDelete}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsConfirmingDelete(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete transactions
            </AlertDialogHeader>

            <AlertDialogBody>Are you sure you want to delete the selected transactions?</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsConfirmingDelete(false)}>
                Cancel
              </Button>
              <Button
                colorScheme='red'
                onClick={() => {
                  setIsConfirmingDelete(false);
                  removeTransactions();
                }}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Transactions;
