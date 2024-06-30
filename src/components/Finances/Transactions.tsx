import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
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
  Tooltip,
  Tr
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
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { MdAdd, MdDelete, MdEdit } from 'react-icons/md';
import Client from '../../Client';
import { IBudget, Transaction } from '../../models/types';
import { useUserStore } from '../../state/UserStore';
import { getCurrencyString } from '../../utils/utils';
import ConfirmDialog from '../ConfirmDialog';
import AddOrEditTransaction from '../Forms/AddOrEditTransaction';

const rowsPerPageOptions = [10, 25, 50, 100];

interface TransactionsProps {
  budget: IBudget;
}

const Transactions = ({ budget }: TransactionsProps) => {
  const family = useUserStore((state) => state.family);

  const [addingOrEditingTransaction, setAddingOrEditingTransaction] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction>();

  const rowsSelectedCount = useMemo(() => Object.keys(rowSelection).length, [rowSelection]);

  const transactionColumns = useMemo<ColumnDef<Transaction>[]>(
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
        cell: (info) => getCurrencyString(info.getValue<number>()),
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
          info.getValue<string>(),
      },
    ],
    []
  );

  const transactionData = useMemo<Transaction[]>(
    () => budget.transactions.map((t) => ({ ...t, timestamp: format(new Date(t.timestamp), 'MM-dd-yy') })),
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

    const updatedTransactions = budget.transactions.filter((_val, idx) => !rowSelection[idx]);

    await Client.updateBudget(family.budgetId, { transactions: updatedTransactions });

    setRowSelection({});
  };

  /* TODO: Hook this back up
  const processTransactionUpdate = (newRow: Transaction, oldRow: Transaction) => {
    if (!family?.budgetId) return oldRow;

    newRow.timestamp = newRow.timestamp.toString();
    const updArr = [...budget.transactions];
    updArr[updArr.findIndex((transaction) => transaction.uid === oldRow.id)] = newRow;

    Client.updateBudget(family.budgetId, { transactions: updArr });

    return newRow;
  };
  */

  return (
    <Box mx={1}>
      <Heading mb={2}>Transactions</Heading>

      <ButtonGroup mb={2}>
        <Button leftIcon={<MdAdd />} onClick={() => setAddingOrEditingTransaction(true)}>
          Add
        </Button>

        <Button
          leftIcon={<MdEdit />}
          onClick={() => {
            setAddingOrEditingTransaction(true);
            setTransactionToEdit(budget.transactions.find((_val, idx) => rowSelection[idx]));
          }}
          isDisabled={rowsSelectedCount !== 1}
        >
          Edit selected
        </Button>

        <Button
          leftIcon={<MdDelete />}
          onClick={() => setIsConfirmingDelete(true)}
          colorScheme='red'
          isDisabled={rowsSelectedCount === 0}
        >
          Remove selected
        </Button>
      </ButtonGroup>

      <Stack mt={3} mb={2}>
        <TableContainer maxHeight='calc(100vh - 420px)' overflowX='auto' overflowY='auto'>
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

        <Stack direction='row' justifyContent='space-between'>
          <Text fontSize='small' mt={2}>{transactionData.length} total{rowsSelectedCount > 0 ? ` (${rowsSelectedCount} selected)` : ''}</Text>

          <Stack direction='row' align='center'>
            <IconButton
              icon={<HiChevronLeft />}
              aria-label='Previous page'
              onClick={table.previousPage}
              isDisabled={!table.getCanPreviousPage()}
              fontSize='large'
              size='xs'
            />

            <Text fontSize='small'>
              {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </Text>

            <IconButton
              icon={<HiChevronRight />}
              aria-label='Next page'
              onClick={table.nextPage}
              isDisabled={!table.getCanNextPage()}
              fontSize='large'
              size='xs'
            />
          </Stack>

          <Tooltip label='Rows per page'>
            <Select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              variant='flushed'
              width='55px'
              size='xs'
            >
              {rowsPerPageOptions.map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </Select>
          </Tooltip>
        </Stack>
      </Stack>

      <AddOrEditTransaction
        isOpen={addingOrEditingTransaction}
        setIsOpen={(isOpen) => {
          setAddingOrEditingTransaction(isOpen);

          if (!isOpen) {
            setTransactionToEdit(undefined);
          }
        }}
        budget={budget}
        existingTransaction={transactionToEdit}
      />

      <ConfirmDialog
        title='Delete transactions'
        text='Are you sure you want to delete the selected transactions?'
        primaryActionText='Delete'
        isOpen={isConfirmingDelete}
        onClose={(confirmed) => {
          if (confirmed) {
            removeTransactions();
          }

          setIsConfirmingDelete(false);
        }}
      />
    </Box>
  );
};

export default Transactions;
