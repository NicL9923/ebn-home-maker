import { Typography } from '@mui/material';
import React from 'react';

const Budget = () => {
  return (
    <div>
      <Typography variant='h4'>Budget</Typography>
        <div>Month Year</div>

      <Typography variant='h4'>Savings</Typography>

      <Typography variant='h4'>Investments</Typography>

      <Typography variant='h4'>Transactions</Typography>
    </div>
  );
}

export default Budget;

/*
  import { getAuth } from "firebase/auth";

  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    // ...
  } else {
    // No user is signed in.
  }
*/