import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Button, Paper, Stack, Typography, Box, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const dgColumns = [
    { field: 'amt', headerName: 'Amount' },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'subcategory', headerName: 'Subcategory', width: 150 },
    { field: 'timestamp', headerName: 'Date', width: 200 }
];

const Transactions = (props) => {
    const { budget, getBudget } = props;
    const [addingTransaction, setAddingTransaction] = useState(false);
    const [newTransactionName, setNewTransactionName] = useState('');
    const [newTransactionAmt, setNewTransactionAmt] = useState('');

    const saveNewTransaction = () => {
        // TODO
    };

    return (
        <Box mt={3}>
            <Paper sx={{ p: 2 }}>
                <Typography variant='h3' mb={2}>Transactions</Typography>
                <Stack height={500} mb={3}>
                    <DataGrid
                        columns={dgColumns}
                        rows={budget.transactions}
                        pageSize={10}
                        rowsPerPageOptions={[5, 10, 20, 50, 100]}
                    />
                </Stack>
                <Button startIcon={<Add />} variant='contained' onClick={() => setAddingTransaction(true)}>Add transaction</Button>
            </Paper>

            <Dialog open={addingTransaction} onClose={() => setAddingTransaction(false)}>
                <DialogTitle>Add Transaction</DialogTitle>

                <DialogContent>
                    <TextField
                        autoFocus
                        variant='standard'
                        label='Amount'
                        type={'number'}
                        value={newTransactionAmt}
                        onChange={(event) => setNewTransactionAmt(event.target.value)}
                    />

                    <TextField
                        autoFocus
                        variant='standard'
                        label='Name'
                        type={'number'}
                        value={newTransactionName}
                        onChange={(event) => setNewTransactionName(event.target.value)}
                    />

                    {/* TODO: Add switch to pick (sub-)category & date-picker for date */ }
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setAddingTransaction(false)}>Cancel</Button>
                    <Button variant='contained' onClick={saveNewTransaction}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Transactions;