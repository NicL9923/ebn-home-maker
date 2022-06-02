import { Add } from '@mui/icons-material';
import { Box, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { doc, setDoc } from 'firebase/firestore';
import React, { useContext } from 'react';
import { CartesianGrid, Line, LineChart, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts';
import { FirebaseContext } from '..';
import { UserContext } from '../App';
import EditableLabel from './EditableLabel';

const Investments = (props) => {
    const { db } = useContext(FirebaseContext);
    const { profile } = useContext(UserContext);
    const { budget, getBudget } = props;

    const createNewAcct = () => {
        const updArr = [...budget.investmentAccts];

        updArr.push({
            name: 'New account',
            broker: 'Acct Broker',
            curValue: 1000,
            prevValues: [{ monthYear: '1/1/2020', value: 250 }]
        });
        
        setDoc(doc(db, 'budgets', profile.budgetId), { investmentAccts: updArr }, { merge: true }).then(() => getBudget());
    };

    const updateAcctName = (newAcctName, acctIdx) => {
        const updArr = [...budget.investmentAccts];

        updArr[acctIdx].name = newAcctName;

        setDoc(doc(db, 'budgets', profile.budgetId), { investmentAccts: updArr }, { merge: true }).then(() => getBudget());
    };

    const updateAcctBroker = (newAcctBroker, acctIdx) => {
        const updArr = [...budget.investmentAccts];

        updArr[acctIdx].broker = newAcctBroker;

        setDoc(doc(db, 'budgets', profile.budgetId), { investmentAccts: updArr }, { merge: true }).then(() => getBudget());
    };
    
    const deleteAcct = (acctIdx) => {
        const updArr = [...budget.investmentAccts];

        updArr.splice(acctIdx, 1);

        setDoc(doc(db, 'budgets', profile.budgetId), { investmentAccts: updArr }, { merge: true }).then(() => getBudget());
    };

    return (
        <Box mt={2}>
            <Typography variant='h3' mb={2}>Investment Accounts</Typography>
            <Grid container mb={3} rowGap={3}>
                {budget.investmentAccts.map((acct, idx) =>
                    <Grid container item xs={12} md={6} key={acct.name}>
                        <Paper sx={{ p: 2 }}>
                            <EditableLabel onBlur={(newVal) => updateAcctName(newVal, idx)} initialValue={acct.name} variant='h4' />
                            <EditableLabel onBlur={(newVal) => updateAcctBroker(newVal, idx)}  initialValue={acct.broker} variant='h5' />
                            <Typography variant='h6' mt={2} mb={3}>Current Valuation: ${parseFloat(acct.curValue).toFixed(2)}</Typography>

                            <LineChart width={400} height={350} data={[...acct.prevValues, { monthYear: new Date().toLocaleDateString(), value: acct.curValue }]}>
                                <CartesianGrid strokeDasharray='3 3' />
                                <XAxis dataKey='monthYear' />
                                <YAxis />
                                <ChartTooltip formatter={(value) => `$${value}`} />
                                <Line type='monotone' dataKey='value' stroke='#82ca9d' activeDot={{ r: 6 }} name='Value' />
                            </LineChart>

                            <Stack direction='row' mt={2} justifyContent='space-evenly'>
                                <Button variant='contained'>Modify value points</Button>
                                <Button variant='text' onClick={() => deleteAcct(idx)}>Delete account</Button>
                            </Stack>
                        </Paper>
                    </Grid>
                )}
            </Grid>
            <Button variant='contained' startIcon={<Add />} onClick={createNewAcct}>Add investment account</Button>
        </Box>
    );
};

export default Investments;