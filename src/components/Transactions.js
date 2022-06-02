import React, { useContext, useState } from 'react';
import { Add, Delete } from '@mui/icons-material';
import { Button, Paper, Stack, Typography, Box, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Select, ListSubheader, MenuItem, FormControl, InputLabel } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { doc, setDoc } from 'firebase/firestore';
import { UserContext } from '../App';
import { FirebaseContext } from '..';

const dgColumns = [
    { field: 'amt', headerName: 'Amount', editable: true },
    { field: 'name', headerName: 'Name', flex: 1, editable: true },
    { field: 'subcategory', headerName: 'Subcategory', width: 150, editable: true },
    { field: 'timestamp', headerName: 'Date', width: 200, editable: true }
];

const Transactions = (props) => {
    const { budget, getBudget } = props;
    const { db } = useContext(FirebaseContext);
    const { profile } = useContext(UserContext);
    const [addingTransaction, setAddingTransaction] = useState(false);
    const [newTransactionName, setNewTransactionName] = useState('');
    const [newTransactionAmt, setNewTransactionAmt] = useState('');
    const [newTransactionCat, setNewTransactionCat] = useState('');
    const [newTransactionDate, setNewTransactionDate] = useState(null);
    const [selection, setSelection] = useState([]);

    const saveNewTransaction = () => {
        const updArr = [...budget.transactions];
        const splitCats = newTransactionCat.split('-');

        updArr.push({
            amt: parseFloat(newTransactionAmt),
            name: newTransactionName,
            timestamp: newTransactionDate.toString(),
            category: splitCats[0],
            subcategory: splitCats[1]
        });

        setDoc(doc(db, 'budgets', profile.budgetId), { transactions: updArr }, { merge: true }).then(() => {
            getBudget();
            setAddingTransaction(false);
            setNewTransactionName('');
            setNewTransactionAmt('');
            setNewTransactionCat('');
            setNewTransactionDate(null);
        });
    };

    const removeTransactions = () => {
        let updArr = [...budget.transactions];

        updArr = updArr.filter((val, idx) => selection.indexOf(idx)); // Efficient way to remove transaction(s) from array

        setDoc(doc(db, 'budgets', profile.budgetId), { transactions: updArr }, { merge: true }).then(() => {
            getBudget();
            setSelection([]);
        });
    };

    const getCatSelectList = () => {
        const catSelectArr = [];
        
        budget.categories.forEach(category => {
            catSelectArr.push(<ListSubheader>{category.name}</ListSubheader>);
            
            category.subcategories.forEach(subcat => {
                catSelectArr.push(<MenuItem value={`${category.name}-${subcat.name}`}>{subcat.name}</MenuItem>);
            });
        });

        return catSelectArr;
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
                        selectionModel={selection}
                        onSelectionModelChange={setSelection}
                        experimentalFeatures={{ newEditingApi: true }}
                        checkboxSelection
                        disableSelectionOnClick
                    />
                </Stack>
                
                <Stack direction='row' spacing={2}>
                    <Button startIcon={<Add />} variant='contained' onClick={() => setAddingTransaction(true)}>Add transaction</Button>
                    { selection.length > 0 && 
                        <Button startIcon={<Delete />} variant='contained' color='error' onClick={removeTransactions}>Remove transaction{selection.length > 1 && 's'}</Button>
                    }
                </Stack>
            </Paper>

            <Dialog open={addingTransaction} onClose={() => setAddingTransaction(false)}>
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
                            label='Name'
                            value={newTransactionName}
                            onChange={(event) => setNewTransactionName(event.target.value)}
                        />

                        <FormControl variant='standard' sx={{ mt: 2, mb: 2 }}>
                            <InputLabel id='selectLbl'>Category</InputLabel>
                            <Select labelId='selectLbl' value={newTransactionCat.split('-')[1]} onChange={(event) => setNewTransactionCat(event.target.value)}>
                                {getCatSelectList()}
                            </Select>
                        </FormControl>

                        <LocalizationProvider dateAdapter={AdapterLuxon}>
                            <DateTimePicker
                                label='Date/Time'
                                value={newTransactionDate}
                                onChange={setNewTransactionDate}
                                renderInput={(params) => <TextField { ...params } variant='standard' />}
                            />
                        </LocalizationProvider>
                    </Stack>
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