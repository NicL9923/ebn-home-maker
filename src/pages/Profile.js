import React, { useState, useEffect } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { Avatar, Button, IconButton, Input, Stack, Typography } from '@mui/material';
import { Add, Close, Edit, PhotoCamera } from '@mui/icons-material';
import MapPicker from 'react-google-map-picker';

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
    <>
      <Typography variant='h2'>My Profile</Typography>

      <div>
        {!profile ? (
          <div>
            You don't have a profile!
          </div>
        ) : (
          <Stack alignItems='center' justifyContent='center'>
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
          </Stack>
        )}
        
        {!family ? (
          <div>
            You're not part of a family yet! Ask the head of a family you want to join for the invite link.
          </div>
        ) : (
          <div>
            <h3>My Family</h3>

            <div>
              <p>Family Name</p>
              <div>{family.name}</div>
              {user.uid === family.headOfFamily && <IconButton><Edit /></IconButton>}
            </div>

            <div>
              <p>Members</p>
              <Stack direction='row'>
                {familyMemberProfiles && familyMemberProfiles.map(profile =>
                  <div key={profile.firstName}>
                    <p>{profile.firstName}</p>
                    <Avatar src={profile.imgLink} alt='family member' />
                    {user.uid === family.headOfFamily && <Button variant='outlined' startIcon={<Close />}>Remove</Button>}
                  </div>
                )}
              </Stack>
            </div>
            <div>
              <p>Pets</p>
              <Stack direction='row'>
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
              </Stack>
              {user.uid === family.headOfFamily && <Button variant='outlined' startIcon={<Add />}>Add a pet</Button>}
            </div>

            <div>Family events (hOF can add/remove/change events)</div>

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
                    defaultLocation={{ lat: parseFloat(family.location.lat), lng: parseFloat(family.location.long) }}
                    style={{ height: 500, width: 750 }}
                    onChangeLocation={(newLat, newLong) => { console.log(newLat + ' ' + newLong) }}
                    apiKey={family.gmaps_api_key}
                  />
                </div>

                <div>
                  <p>Google Maps API Key</p>
                  <p>{family.gmaps_api_key}</p>
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
    </>
  );
}

export default Profile;
