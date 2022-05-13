import React, { useState, useEffect } from 'react';
import { getDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, InputLabel, Stack, TextField, Typography } from '@mui/material';
import { Add, Close, ContentCopyOutlined, Edit } from '@mui/icons-material';
import MapPicker from 'react-google-map-picker';
import { DropzoneArea } from 'mui-file-dropzone';
import { v4 as uuidv4 } from 'uuid';
import copy from 'clipboard-copy';
import NoFamily from '../components/NoFamily';

const Profile = (props) => {
  const { profile, getProfile, family, getFamily, user, db } = props;
  const [familyMemberProfiles, setFamilyMemberProfiles] = useState([]);
  // Profile edit
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileEditedName, setProfileEditedName] = useState(null);
  const [profileEditedPhoto, setProfileEditedPhoto] = useState(null);

  const [deletingFamily, setDeletingFamily] = useState(false);
  const [leavingFamily, setLeavingFamily] = useState(false);
  
  const getFamilyMemberProfiles = () => {
    if (!family.members) return;
    
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

  const saveEditedProfile = () => {
    if (profileEditedPhoto) {
      // Submit new profile picture to Storage and get/save link, and remove old one
      const storage = getStorage();
      const oldImgRef = ref(storage, profile.imgLink);
      deleteObject(oldImgRef).then(() => {
        // File deleted successfully - TODO: Snackbars for successfully deleting/updating things?
      }).catch((error) => {
        console.error(error);
      });

      const imgRef = ref(storage, uuidv4());
      uploadBytes(imgRef, profileEditedPhoto).then(snapshot => {
        getDownloadURL(snapshot.ref).then(url => { 
          setDoc(doc(db, 'profiles', user.uid), { imgLink: url }, { merge: true }).then(() => {
            getProfile(user.uid);
          });
        });
      });
    }
    
    // Submit new profile name
    if (profileEditedName) {
      setDoc(doc(db, 'profiles', user.uid), { firstName: profileEditedName }, { merge: true }).then(() => {
        getProfile(user.uid);
      });
    }

    setProfileEditedName(null);
    setProfileEditedPhoto(null);
    setEditingProfile(false);
  };

  const deleteFamily = () => {
    // Set each profile in family.members familyId property to ''
    if (family.members) {
      family.members.forEach(member => {
        setDoc(doc(db, 'profiles', member), { familyId: '' }, { merge: true });
      });
    }

    // Delete residences and vehicles
    if (family.residences) {
      family.residences.forEach(res => {
        deleteDoc(doc(db, 'residences', res));
      });
    }

    if (family.vehicles) {
      family.vehicles.forEach(veh => {
        deleteDoc(doc(db, 'vehicles', veh));
      });
    }

    // Delete family doc
    deleteDoc(doc(db, 'families', profile.familyId)).then(() => {
      setDoc(doc(db, 'profiles', user.uid), { familyId: '' }, { merge: true }).then(() => {
        getProfile(user.uid);
      });
    });
  };

  const leaveFamily = () => {
    // Make first member in family new headOfFamily
    if (family.members && family.members[0]) {
      setDoc(doc(db, 'families', profile.familyId), { headOfFamily: family.members[0] }, { merge: true });
    }
    
    setDoc(doc(db, 'profiles', user.uid), { familyId: '' }, { merge: true }).then(() => {
      getProfile(user.uid);
    });
  };

  useEffect(() => {
    if (family) getFamilyMemberProfiles();
  }, [family]);

  return (
    <Stack maxWidth='md' mx='auto'>
      <Typography variant='h2'>My Profile</Typography>

      <Stack alignItems='center' justifyContent='center'>
        <Avatar src={profile.imgLink ? profile.imgLink : null} alt='profile' sx={{ width: 164, height: 164 }}>{profile.imgLink ? null : profile.firstName[0].toUpperCase()}</Avatar>
        
        <Typography variant='h5'>{profile.firstName}</Typography>
        
        <Button variant='outlined' startIcon={<Edit />} onClick={() => setEditingProfile(true)}>Edit Profile</Button>

        {editingProfile &&
          <Dialog open={editingProfile} onClose={() => setEditingProfile(false)}>
            <DialogTitle>Edit Profile</DialogTitle>

            <DialogContent>
              <TextField
                autoFocus
                variant='standard'
                label='First Name'
                value={profileEditedName}
                onChange={(event) => setProfileEditedName(event.target.value)}
              />

              <InputLabel>Upload Photo</InputLabel>
              <DropzoneArea
                acceptedFiles={['image/jpeg', 'image/png']}
                filesLimit={1}
                onChange={(files) => setProfileEditedPhoto(files[0])}
              />
              {/* TODO: add button/whatever to delete profile pic */}
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setEditingProfile(false)}>Cancel</Button>
              <Button variant='contained' onClick={saveEditedProfile}>Save</Button>
            </DialogActions>
          </Dialog>
        }
      </Stack>
      
      {!family ? (<NoFamily profile={profile} db={db} user={user} getProfile={getProfile} getFamily={getFamily} />) : (
        <>
          <Typography variant='h3'>My Family</Typography>

          <>
            <Typography variant='h5'>Family Name</Typography>
            <Stack direction='row'>
              <Typography variant='h6'>{family.name}</Typography>
              {user.uid === family.headOfFamily && 
                <IconButton><Edit /></IconButton>
              }
            </Stack>
          </>

          <>
            <Typography variant='h5'>Members</Typography>
            <Stack direction='row'>
              {familyMemberProfiles && familyMemberProfiles.map(prof =>
                <Stack key={prof.firstName} alignItems='center' justifyContent='center'>
                  <Typography variant='h6'>{prof.firstName}</Typography>
                  <Avatar src={prof.imgLink ? prof.imgLink : null} alt='family member' sx={{ width: 128, height: 128 }}>{prof.imgLink ? null : prof.firstName[0].toUpperCase()}</Avatar>
                  {user.uid === family.headOfFamily &&
                    <Button variant='outlined' startIcon={<Close />}>Remove</Button>
                  }
                </Stack>
              )}
            </Stack>
            {user.uid === family.headOfFamily &&
              <Button variant='contained' startIcon={<ContentCopyOutlined />} onClick={() => copy(`https://our-home-239c1.firebaseapp.com/joinFamily/${profile.familyId}`)}>Copy member invite link</Button>
            }
          </>

          <>
            <Typography variant='h5'>Pets</Typography>
            <Stack direction='row'>
              {family.pets && family.pets.map(pet =>
                <Stack key={pet.name} alignItems='center' justifyContent='center'>
                  <Typography variant='body1'>{pet.name}</Typography>
                  <Avatar src={pet.imgLink ? pet.imgLink : null} alt='pet' sx={{ width: 96, height: 96 }}>{pet.imgLink ? null : pet.name[0].toUpperCase()}</Avatar>
                  {user.uid === family.headOfFamily &&
                    <Stack>
                      <Button variant='outlined' startIcon={<Edit />}>Edit</Button>
                      <Button variant='outlined' startIcon={<Close />}>Remove</Button>
                    </Stack>
                  }
                </Stack>
              )}
            </Stack>
            {user.uid === family.headOfFamily &&
              <Button variant='contained' startIcon={<Add />}>Add a pet</Button>
            }
          </>

          {user.uid === family.headOfFamily && 
            <Stack>
              <Typography variant='h5'>Weather Applet Information</Typography>

              <Stack>
                <Typography variant='h6'>Google Maps API Key</Typography>
                <Stack direction='row'>
                  <Typography variant='body1'>{family.gmaps_api_key}</Typography>
                  <IconButton><Edit /></IconButton>
                </Stack>
              </Stack>
              
              <Stack>
                <Typography variant='h6'>OpenWeatherMap API Key</Typography>
                <Stack direction='row'>
                  <Typography variant='body1'>{family.openweathermap_api_key}</Typography>
                  <IconButton><Edit /></IconButton>
                </Stack>
              </Stack>

              <Typography variant='h6'>Location</Typography>
              {family.location &&
                <Stack>
                  <Stack>
                    <Typography variant='body1'>Latitude: {family.location.lat}</Typography>
                    <Typography variant='body1'>Longitude: {family.location.long}</Typography>
                  </Stack>
                  <MapPicker
                    defaultLocation={{ lat: parseFloat(family.location.lat), lng: parseFloat(family.location.long) }}
                    style={{ height: 500, width: 750 }}
                    onChangeLocation={(newLat, newLong) => { console.log(newLat + ' ' + newLong) }}
                    apiKey={family.gmaps_api_key}
                  />
                </Stack>
              }

              {user.uid === family.headOfFamily ? (
                <Button variant='outlined' startIcon={<Close />}>Delete Family</Button>
                ) : (
                  <Button variant='contained'>Leave Family</Button>
                )
              }

              <Dialog open={deletingFamily} onClose={() => setDeletingFamily(false)}>
                <DialogTitle>Delete family?</DialogTitle>
                <DialogContent>
                  <DialogContentText>Are you sure you want to delete the {family.name} family?</DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button variant='text' onClick={() => setDeletingFamily(false)}>Cancel</Button>
                  <Button variant='contained' onClick={deleteFamily}>Delete</Button>
                </DialogActions>
              </Dialog>

              <Dialog open={leavingFamily} onClose={() => setLeavingFamily(false)}>
                <DialogTitle>Leave family?</DialogTitle>
                <DialogContent>
                  <DialogContentText>Are you sure you want to leave the {family.name} family?</DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button variant='text' onClick={() => setLeavingFamily(false)}>Cancel</Button>
                  <Button variant='contained' onClick={leaveFamily}>Leave</Button>
                </DialogActions>
              </Dialog>
            </Stack>
          }
        </>
      )}
    </Stack>
  );
}

export default Profile;
