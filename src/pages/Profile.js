import React, { useState, useEffect } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import HomeButton from '../components/HomeButton';

// TODO: figure out if there's a map package that users can find their home address so we can get the lat/long from it to store in the family doc

const Profile = (props) => {
  const { profile, setProfile, family, setFamily, user, db } = props;
  const [familyMemberProfiles, setFamilyMemberProfiles] = useState([]);
  
  const getFamilyMemberProfiles = () => {
    let famMemProfs = [];

    family.members.forEach(async (member) => {
      if (member === user.uid) return;

      const profileDoc = await getDoc(doc(db, 'profiles', member));

      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        famMemProfs.push(profileData);
        setFamilyMemberProfiles(famMemProfs);
      } else {
        // Specified family member doesn't exist
      }
    });
  };

  useEffect(() => {
    if (family) getFamilyMemberProfiles();
  }, [family]);

  return (
    <div>
      <HomeButton />
      <h1 className='flex flex-row justify-center text-6xl font-bold'>Profile</h1>

      <div className='flex flex-col items-center'>
        {!profile ? (
          <div>
            You don't have a profile!
          </div>
        ) : (
          <div>
            <h3 className='text-3xl font-bold'>My Profile</h3>
            <div>
              <p>My Name</p>
              <div>{profile.firstName} (changeable)</div>
            </div>
            <div>
              <p>My Photo</p>
              <img src={profile.imgLink} className='h-40 w-40 rounded-full border-2 border-zinc-800' alt='profile' />
              <p>Picture (changeable)</p>
            </div>
          </div>
        )}
        
        {!family ? (
          <div>
            You're not part of a family yet! Ask the head of a family you want to join for the invite link.
          </div>
        ) : (
          <div>
            <h3 className='text-3xl font-bold'>My Family</h3>

            <div>
              <p>Family name (editable if head of family)</p>
              <div>{family.name}</div>
            </div>

            <div>
              <p>Current members (can remove if head of family)</p>
              <div className='flex flex-row'>
                {familyMemberProfiles && familyMemberProfiles.map(profile =>
                  <div className='flex flex-col items-center' key={profile.firstName}>
                    <p>{profile.firstName}</p>
                    <img className='h-20 w-20 rounded-full border-2 border-zinc-800' src={profile.imgLink} alt='family member' />
                  </div>
                )}
              </div>
            </div>
            <div>
              <p>Pets (can add/remove/change if head of family)</p>
              <div className='flex flex-row'>
                {family.pets.map(pet =>
                  <div className='flex flex-col items-center' key={pet.name}>
                    <p>{pet.name}</p>
                    <img className='h-20 w-20 rounded-full border-2 border-zinc-800' src={pet.imgLink} alt='pet' />
                  </div>
                )}
              </div>
            </div>

            {user.uid === family.headOfFamily && 
              <div>
                <div>Location</div>
                <div>OWM API Key</div>
              </div>
            }

            <div>Invite link to family (TODO: /joinFamily/*familyId*)</div>
            <div>
              <button>Leave Family</button>
              <button>Delete Family (if head of family - remove all users in family from that family and then delete the family record)</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
