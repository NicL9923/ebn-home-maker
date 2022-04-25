import { Typography } from '@mui/material';
import React from 'react';

const Information = () => {
  return (
    <div>
        <Typography variant='h3'>Information</Typography>

        <Typography variant='h4'>Upcoming Events</Typography>

        <Typography variant='h4'>Posts</Typography>
          <div>TODO: posts made by family (subject, msg, timestamp, poster, isPinned)</div>

        <Typography variant='h4'>Guides</Typography>
          <div>TODO: write PDF guides for: what to do in car accident, career options</div>
    </div>
  );
}

export default Information;
