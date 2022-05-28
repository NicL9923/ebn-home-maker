import { Add, Clear, Edit } from '@mui/icons-material';
import { Box, Button, Grid, IconButton, Paper, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Pie, PieChart, Sector } from 'recharts';


const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
  
    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          Savings Blobs
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{payload.name}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`$${value} (${Math.trunc(percent * 100)}%)`}
        </text>
      </g>
    );
};

const Savings = (props) => {
    const { budget, getBudget, profile, db } = props;
    const [savingsChartIndex, setSavingsChartIndex] = useState(0);

    if (budget) return (
      <Box mt={2}>
        <Typography variant='h3' mb={2}>Savings Blobs</Typography>
        <Paper sx={{ p: 2, width: 400, mb: 4 }}>
          <PieChart width={525} height={250}>
            <Pie 
              activeIndex={savingsChartIndex}
              activeShape={renderActiveShape}
              data={budget.savingsBlobs} 
              nameKey='name'
              dataKey='currentAmt'
              innerRadius={80}
              onMouseEnter={(_, index) => setSavingsChartIndex(index)}
            />
          </PieChart>
        </Paper>

        <Grid container mb={4}>
          {budget.savingsBlobs.map(blob =>
            <Grid container item xs={4} key={blob.name}>
              <Paper sx={{ p: 2 }}>
                <Stack direction='row' alignItems='center'>
                  <Typography variant='h5'>{blob.name} </Typography>
                    <IconButton><Edit /></IconButton>
                    <IconButton><Clear /></IconButton>
                </Stack>
                <Typography variant='h6' ml={1}>${blob.currentAmt}</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>

        <Button variant='contained' startIcon={<Add />}>Add savings blob</Button>
      </Box>
    );
};

export default Savings;