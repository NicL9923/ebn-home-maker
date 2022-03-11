import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/outline';

const HomeButton = (props) => {
  return (
    <div className='flex flex-row justify-start'>
      <Link to="/"><HomeIcon className='h-10 w-10' /></Link>
    </div>
  );
}

export default HomeButton;
