import { Add } from '@mui/icons-material';
import { Button, Paper, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import React from 'react';

const Transactions = (props) => {
    const { budget, getBudget, profile, db } = props;

    return (
        <Paper>
            <Typography variant='h4' mt={8}>Transactions</Typography>
            {budget &&
                <Stack height={300}>
                <DataGrid
                    columns={[{ field: 'amt', headerName: 'Amount' }, { field: 'name', headerName: 'Name' }, { field: 'category', headerName: 'Category' }, { field: 'timestamp', headerName: 'Date', width: 200 }]}
                    rows={budget.transactions}
                    pageSize={10}
                    rowsPerPageOptions={[5, 10, 20, 50, 100]}
                />
                <Button startIcon={<Add />} variant='contained'>Add transaction</Button>
                </Stack>
            }
        </Paper>
    );
};

export default Transactions;