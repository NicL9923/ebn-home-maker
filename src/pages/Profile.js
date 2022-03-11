import React, { useState, useEffect } from 'react';

// TODO: figure out if there's a map package that users can find their home address so we can get the lat/long from it to store in the family doc

const Profile = (props) => {
  const { profile, setProfile, family, setFamily, user } = props;
  const [familyMemberProfiles, setFamilyMemberProfiles] = useState(null);
  
  const getFamilyMemberProfiles = () => {
    // TODO - get user names + profile photos from ids in family.members
  };

  useEffect(() => {
    getFamilyMemberProfiles();
  }, []);

  return (
    <div>
      <h1 className='flex flex-row justify-center text-6xl font-bold'>Profile</h1>

      <h3 className='text-3xl font-bold'>My Profile</h3>
      <div>
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

      <h3 className='text-3xl font-bold'>My Family</h3>
      <div>
        <div>
          <p>Family name (editable if head of family)</p>
          <div>{family.name}</div>
        </div>

        <div>
          <p>Current members (can remove if head of family)</p>
          <div>{familyMemberProfiles}</div>
        </div>
        <div>
          <p>Pets (can add/remove/change if head of family)</p>
          <div>
            {family.pets.map(pet =>
              <div>
                <p>{pet.name}</p>
                <img src={pet.imgLink} alt='pet' />
              </div>
            )}
          </div>
        </div>

        {user.uid === family.headOfFamily && 
          <div>
            <div>(IF head of family) Location</div>
            <div>(IF head of family) OWM API Key</div>
          </div>
        }

        <div>Invite link to family (TODO: /joinFamily/*familyId*)</div>
        <div>
          <button>Leave Family</button>
          <button>Delete Family (if head of family - remove all users in family from that family and then delete the family record)</button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
