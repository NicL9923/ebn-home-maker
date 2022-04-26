import { Button, Card, CardActionArea, CardActions, CardContent, CardMedia, Stack, Typography } from '@mui/material';
import React from 'react';

const Maintenance = () => {
  return (
    <div>
        <Typography variant='h3'>Maintenance</Typography>

        <Typography variant='h4'>House</Typography>
        <Stack>
          <Card>
            <CardMedia />
            <CardContent>
              <Typography variant='h5'>asd</Typography>
            </CardContent>
            <CardActionArea>
              <CardActions>
                <Button size="small" color="primary">View log</Button>
              </CardActions>
            </CardActionArea>
          </Card>
        </Stack>

        <Typography variant='h4'>Vehicles</Typography>
        <Stack>
          <div>Map each vehicle to a card</div>

          <Card>
            <CardMedia />
            <CardContent>
              <Typography variant='h5'>asd</Typography>
            </CardContent>
            <CardActionArea>
              <CardActions>
                <Button size="small" color="primary">View log</Button>
              </CardActions>
            </CardActionArea>
          </Card>
        </Stack>
    </div>
  );
}

export default Maintenance;
