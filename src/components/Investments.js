import { Add } from '@mui/icons-material';
import { Box, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import React from 'react';
import { CartesianGrid, Line, LineChart, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts';

const Investments = (props) => {
    const { budget, getBudget, profile, db } = props;

    if (budget) return (
        <Box mt={2}>
            <Typography variant='h3' mb={2}>Investment Accounts</Typography>
            <Grid container mb={3}>
                {budget.investmentAccts.map(acct =>
                    <Grid container item xs={12} md={6} key={acct.name}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant='h5'>{acct.name}</Typography>
                            <Typography variant='h6'>{acct.broker}</Typography>
                            <Typography variant='body1'>Current Valuation: ${acct.curValue}</Typography>

                            <LineChart width={400} height={350} data={[...acct.prevValues, { monthYear: new Date().toLocaleDateString(), value: acct.curValue }]}>
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
                        </Paper>
                    </Grid>
                )}
            </Grid>
            <Button variant='contained' startIcon={<Add />}>Add investment account</Button>
        </Box>
    );
};

export default Investments;