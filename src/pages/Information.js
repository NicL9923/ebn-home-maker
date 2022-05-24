import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

const Information = () => {
  return (
    <Box maxWidth='lg' mx='auto'>
      <Paper sx={{ p: 2 }}>
        <Typography variant='h3' mb={2}>Information</Typography>

        <Box mb={3}>
          <Typography variant='h4'>Upcoming Events</Typography>
          <div>TODO: set/manage family events (on MyProfile page?), check for ones happening soon to put here</div>
        </Box>
        
        <Box mb={3}>
          <Typography variant='h4'>Posts</Typography>
          <div>TODO: posts made by family (subject, msg, timestamp, poster, isPinned)</div>
        </Box>
        
        <Box>
          <Typography variant='h4'>Guides</Typography>
          <div>TODO: write PDF guides for: what to do in car accident, career options</div>
        </Box>
      </Paper>
    </Box>
  );
}

export default Information;
