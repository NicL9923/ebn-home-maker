import React, { useState, useEffect } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { Avatar, Button, IconButton, Input } from '@mui/material';
import { Add, Close, Edit, PhotoCamera } from '@mui/icons-material';
import MapPicker from 'react-google-map-picker';

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
              <div>{profile.firstName}</div>
              <IconButton><Edit /></IconButton>
            </div>
            <div>
              <p>My Photo</p>
              <Avatar src={profile.imgLink} alt='profile' />
              <label htmlFor='icon-button-file'>
                <Input accept='image/*' id='icon-button-file' type='file' />
                <IconButton aria-label='upload picture' component='span'><PhotoCamera /></IconButton>
              </label>
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
              <p>Family Name</p>
              <div>{family.name}</div>
              {user.uid === family.headOfFamily && <IconButton><Edit /></IconButton>}
            </div>

            <div>
              <p>Members</p>
              <div className='flex flex-row'>
                {familyMemberProfiles && familyMemberProfiles.map(profile =>
                  <div key={profile.firstName}>
                    <p>{profile.firstName}</p>
                    <Avatar src={profile.imgLink} alt='family member' />
                    {user.uid === family.headOfFamily && <Button variant='outlined' startIcon={<Close />}>Remove</Button>}
                  </div>
                )}
              </div>
            </div>
            <div>
              <p>Pets</p>
              <div className='flex flex-row'>
                {family.pets.map(pet =>
                  <div key={pet.name}>
                    <p>{pet.name}</p>
                    <Avatar src={pet.imgLink} alt='pet' />
                    {user.uid === family.headOfFamily &&
                      <div>
                        <Button variant='outlined' startIcon={<Edit />}>Edit</Button>
                        <Button variant='outlined' startIcon={<Close />}>Remove</Button>
                      </div>
                    }
                  </div>
                )}
              </div>
              {user.uid === family.headOfFamily && <Button variant='outlined' startIcon={<Add />}>Add a pet</Button>}
            </div>

            <div>Invite link to family (TODO: /joinFamily/*familyId*)</div>
            <div>
              <button>Leave Family</button>
              <button>Delete Family (if head of family - remove all users in family from that family and then delete the family record)</button>
            </div>

            {user.uid === family.headOfFamily && 
              <div>
                <p>Weather Applet Information</p>
                <div>
                  <p>Location</p>
                  <div>
                    <p>Latitude: {family.location.lat}</p>
                    <p>Longitude: {family.location.long}</p>
                  </div>
                  <MapPicker
                    defaultLocation={{ lat: 0, lng: 0 }}
                    style={{ height: '500px' }}
                    onChangeLocation={(newLat, newLong) => { console.log(newLat + ' ' + newLong) }}
                    apiKey='AIzaSyD9p8IuoNFFFDy0-VisdwcX3mzIYNoeAHs'
                  />
                </div>
                
                <div>
                  <p>OWM API Key</p>
                  <p>{family.openweathermap_api_key}</p>
                </div>
              </div>
            }
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
