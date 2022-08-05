import React, { useContext, useState } from 'react';
import { Add, Delete } from '@mui/icons-material';
import { Button, Stack, Typography, Box, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Select, ListSubheader, MenuItem, FormControl, InputLabel } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { doc, updateDoc } from 'firebase/firestore';
import { UserContext } from '../App';
import { FirebaseContext } from '..';

const dgColumns = [
    { field: 'amt', headerName: 'Amount', minWidth: 65, flex: 1, editable: true },
    { field: 'name', headerName: 'Description', minWidth: 120, flex: 1, editable: true },
    { field: 'subcategory', headerName: 'Subcategory', minWidth: 90, flex: 1, editable: true },
    { field: 'timestamp', headerName: 'Date', width: 100, editable: true }
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

        updateDoc(doc(db, 'budgets', profile.budgetId), { transactions: updArr }).then(() => {
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

        updateDoc(doc(db, 'budgets', profile.budgetId), { transactions: updArr }).then(() => {
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
        <Box mt={2} ml={1} mr={1}>
            <Typography variant='h3' mb={2}>Transactions</Typography>
            <Button startIcon={<Add />} variant='contained' onClick={() => setAddingTransaction(true)}>Add transaction</Button>
            <Stack height={500} mt={3} mb={2}>
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
            
            { selection.length > 0 && 
                <Button startIcon={<Delete />} variant='contained' color='error' onClick={removeTransactions} sx={{ mb: 3 }}>Remove transaction{selection.length > 1 && 's'}</Button>
            }

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
                            <Select labelId='selectLbl' value={newTransactionCat.split('-')[1]} onChange={(event) => setNewTransactionCat(event.target.value)}>
                                {getCatSelectList()}
                            </Select>
                        </FormControl>

                        <LocalizationProvider dateAdapter={AdapterLuxon}>
                            <DatePicker
                                label='Date'
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