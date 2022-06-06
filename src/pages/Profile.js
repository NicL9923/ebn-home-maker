import React, { useState, useEffect, useContext } from 'react';
import { getDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { Avatar, Button, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, InputLabel, Paper, Stack, TextField, Typography } from '@mui/material';
import { Add, Close, ContentCopyOutlined, Edit, Logout } from '@mui/icons-material';
import MapPicker from 'react-google-map-picker';
import { DropzoneArea } from 'mui-file-dropzone';
import { v4 as uuidv4 } from 'uuid';
import copy from 'clipboard-copy';
import NoFamily from '../components/NoFamily';
import { UserContext } from '../App';
import { FirebaseContext } from '..';

const Profile = () => {
  const { db } = useContext(FirebaseContext);
  const { userId, profile, family, getProfile } = useContext(UserContext);
  const [familyMemberProfiles, setFamilyMemberProfiles] = useState([]);
  // Profile edit
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileEditedName, setProfileEditedName] = useState(null);
  const [profileEditedPhoto, setProfileEditedPhoto] = useState(null);

  const [deletingFamily, setDeletingFamily] = useState(false);
  const [leavingFamily, setLeavingFamily] = useState(false);
  
  const mergeProfileProperty = (profObjToMerge, profileId = userId, refreshProfile = true) => {
    setDoc(doc(db, 'profiles', profileId), profObjToMerge, { merge: true }).then(() => {
      if (refreshProfile) getProfile();
    });
  };

  const getFamilyMemberProfiles = () => {
    if (!family.members) return;
    
    let famMemProfs = [];

    family.members.forEach(member => {
      if (member === userId) return;

      getDoc(doc(db, 'profiles', member)).then(doc => {
        if (doc.exists()) {
          const profileData = doc.data();
          famMemProfs.push(profileData);
          setFamilyMemberProfiles(famMemProfs);
        } else {
          // Specified family member doesn't exist
        }
      });
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
          mergeProfileProperty({ imgLink: url });
        });
      });
    }
    
    // Submit new profile name
    if (profileEditedName) {
      mergeProfileProperty({ firstName: profileEditedName });
    }

    setProfileEditedName(null);
    setProfileEditedPhoto(null);
    setEditingProfile(false);
  };

  const deleteFamily = () => {
    // Set each profile in family.members familyId property to ''
    if (family.members) {
      family.members.forEach(member => {
        mergeProfileProperty({ familyId: '' }, member, false);
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
      mergeProfileProperty({ familyId: '' });
    });
  };

  const leaveFamily = () => {
    // Make first member in family new headOfFamily
    if (family.members && family.members[0]) {
      setDoc(doc(db, 'families', profile.familyId), { headOfFamily: family.members[0] }, { merge: true });
    }
    
    mergeProfileProperty({ familyId: '' });
  };

  useEffect(() => {
    if (family) getFamilyMemberProfiles();
  }, [family]);

  return (
    <Container maxWidth='md'>
      <Paper sx={{ mb: 4, p: 3 }}>
        <Typography variant='h2'>My Profile</Typography>

        <Stack alignItems='center' justifyContent='center'>
          <Avatar src={profile.imgLink ? profile.imgLink : null} alt='profile' sx={{ width: 164, height: 164 }}>{profile.imgLink ? null : <Typography variant='h1'>{profile.firstName[0].toUpperCase()}</Typography>}</Avatar>
          
          <Typography variant='h5' mt={1} mb={2}>{profile.firstName}</Typography>
          
          <Button variant='outlined' startIcon={<Edit />} onClick={() => setEditingProfile(true)}>Edit Profile</Button>

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
        </Stack>
      </Paper>
      
      {!family ? (<NoFamily />) : (
        <Paper sx={{ p: 3 }}>
          <Typography variant='h3'>My Family</Typography>

          <Stack mt={1} mb={4}>
            <Stack direction='row' alignItems='center'>
              <Typography variant='h5'>Family Name</Typography>
              {userId === family.headOfFamily && 
                <IconButton><Edit /></IconButton>
              }
            </Stack>

            <Typography variant='h6'>{family.name}</Typography>
          </Stack>

          <Stack mb={4}>
            <Typography variant='h5'>Members</Typography>
            <Stack direction='row'>
              {familyMemberProfiles && familyMemberProfiles.map(prof =>
                <Stack key={prof.firstName} alignItems='center' justifyContent='center'>
                  <Typography variant='h6'>{prof.firstName}</Typography>
                  <Avatar src={prof.imgLink ? prof.imgLink : null} alt='family member' sx={{ width: 128, height: 128 }}>{prof.imgLink ? null : prof.firstName[0].toUpperCase()}</Avatar>
                  {userId === family.headOfFamily &&
                    <Button variant='outlined' startIcon={<Close />}>Remove</Button>
                  }
                </Stack>
              )}
            </Stack>
            {userId === family.headOfFamily &&
              <Button variant='contained' startIcon={<ContentCopyOutlined />} onClick={() => copy(`https://our-home-239c1.firebaseapp.com/joinFamily/${profile.familyId}`)}>Copy family invite link</Button>
            }
          </Stack>

          <Stack>
            <Typography variant='h5'>Pets</Typography>
            <Stack direction='row'>
              {family.pets && family.pets.map(pet =>
                <Stack key={pet.name} alignItems='center' justifyContent='center'>
                  <Typography variant='body1'>{pet.name}</Typography>
                  <Avatar src={pet.imgLink ? pet.imgLink : null} alt='pet' sx={{ width: 96, height: 96 }}>{pet.imgLink ? null : pet.name[0].toUpperCase()}</Avatar>
                  {userId === family.headOfFamily &&
                    <Stack>
                      <Button variant='outlined' startIcon={<Edit />}>Edit</Button>
                      <Button variant='outlined' startIcon={<Close />}>Remove</Button>
                    </Stack>
                  }
                </Stack>
              )}
            </Stack>
            {userId === family.headOfFamily &&
              <Button variant='contained' startIcon={<Add />}>Add a pet</Button>
            }
          </Stack>

          {userId === family.headOfFamily && 
            <Stack mt={4}>
              <Divider />
              <Typography variant='h5' mt={2}>Weather Applet Information</Typography>

              <Stack mt={1} mb={2}>
                <Stack direction='row' alignItems='center'>
                  <Typography variant='h6'>Google Maps API Key</Typography>
                  <IconButton><Edit /></IconButton>
                </Stack>

                <Typography variant='body1'>
                  {family.gmaps_api_key ? family.gmaps_api_key : 
                    `Obtain and input a Google Maps API key if you would like
                    to use the built-in location picker, otherwise manually find/input
                    your location's coordinates`
                  }
                </Typography>
              </Stack>
              
              <Stack mb={2}>
                <Stack direction='row' alignItems='center'>
                  <Typography variant='h6'>OpenWeatherMap API Key</Typography>
                  <IconButton><Edit /></IconButton>
                </Stack>
                
                <Typography variant='body1'>
                  {family.openweathermap_api_key ? family.openweathermap_api_key :
                    `Obtain and input an OpenWeatherMap 'Current Weather' API key,
                    and set your family's location below, if you would like to see
                    your local weather forecast on the homepage`
                  }
                </Typography>
              </Stack>

              <Stack mb={6}>
                <Stack direction='row' alignItems='center'>
                  <Typography variant='h6'>Location</Typography>
                  <IconButton><Edit /></IconButton>
                </Stack>
                {family.location &&
                  <Stack>
                    <Stack>
                      <Typography variant='body1'>Latitude: {family.location.lat}</Typography>
                      <Typography variant='body1'>Longitude: {family.location.long}</Typography>
                    </Stack>
                    {family.gmaps_api_key && 
                      <MapPicker
                        defaultLocation={{ lat: parseFloat(family.location.lat), lng: parseFloat(family.location.long) }}
                        style={{ height: 500, width: 750 }}
                        onChangeLocation={(newLat, newLong) => { console.log(newLat + ' ' + newLong) }}
                        apiKey={family.gmaps_api_key}
                      />
                    }
                  </Stack>
                }
              </Stack>

              {userId === family.headOfFamily ? (
                <Button variant='outlined' startIcon={<Close />}>Delete Family</Button>
              ) : (
                <Button variant='contained' startIcon={<Logout />}>Leave Family</Button>
              )}

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
        </Paper>
      )}
    </Container>
  );
}

export default Profile;
