import React, { useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';

// TODO: Profile icon that can be clicked to show menu (edit profile, sign out, etc.) in top right of page

const ProfileIcon = (props) => {
  const auth = getAuth();
  const [isHidden, setIsHidden] = useState(true);

  const handleSignOut = () => signOut(auth).then(() => {
    console.log("Successfully signed out");
  }).catch(error => {
    console.error("Error signing out: " + error);
  });

  return (
    <div className='flex flex-row justify-end'>
      <div>
        <img onClick={() => setIsHidden(!isHidden)} className='h-12 w-12 rounded-full border-2 border-zinc-800' src={props.imgLink} alt='profile' />

        <div className={`${isHidden ? 'hidden ' : ''}z-10 w-44 text-base list-none rounded divide-y divide-gray-300`}>
          <div><Link to='/profile' className='py-1'>My Profile</Link></div>
          
          <button onClick={handleSignOut} className='py-1'>Sign Out</button>
        </div>
      </div>
    </div>
  );
}

export default ProfileIcon;
