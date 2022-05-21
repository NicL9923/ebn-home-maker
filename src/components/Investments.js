import { Button, Paper, Stack, Typography } from '@mui/material';
import React from 'react';
import { CartesianGrid, Line, LineChart, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts';

const Investments = (props) => {
    const { budget, getBudget, profile, db } = props;

    return (
        <Paper>
            <Typography variant='h4' mt={8}>Investment Accounts</Typography>
            <Stack>
                {budget &&
                <>
                    {budget.investmentAccts.map(acct =>
                    <Stack key={acct.name}>
                        <Typography variant='h5'>{acct.name}</Typography>
                        <Typography variant='h6'>{acct.broker}</Typography>
                        <Typography variant='body1'>Current Valuation: ${acct.curValue}</Typography>

                        <LineChart width={400} height={350} data={[...acct.prevValues, { monthYear: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), value: acct.curValue }]}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey='monthYear' />
                        <YAxis />
                        <ChartTooltip formatter={(value) => `$${value}`} />
                        <Line type='monotone' dataKey='value' stroke='#82ca9d' activeDot={{ r: 6 }} name='Value' />
                        </LineChart>

                        <Stack direction='row'>
                        <Button variant='contained'>Modify value points</Button>
                        <Button variant='outlined'>Delete account</Button>
                        </Stack>
                    </Stack>
                    )}

                    <Button variant='contained'>Add investment account</Button>
                </>
                }
            </Stack>
        </Paper>
    );
};

export default Investments;