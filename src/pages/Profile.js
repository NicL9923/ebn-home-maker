import React, { useState, useEffect, useContext } from 'react';
import { getDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { Avatar, Box, Button, Checkbox, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControlLabel, IconButton, InputLabel, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material';
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
  const [copiedInviteLink, setCopiedInviteLink] = useState(false);
  // Profile edit
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileEditedName, setProfileEditedName] = useState(profile.firstName);
  const [profileEditedPhoto, setProfileEditedPhoto] = useState(null);
  const [deleteExistingPhoto, setDeleteExistingPhoto] = useState(false);

  const [deletingFamily, setDeletingFamily] = useState(false);
  const [leavingFamily, setLeavingFamily] = useState(false);
  
  const mergeProfileProperty = (profObjToMerge, profileId = userId, refreshProfile = true) => {
    updateDoc(doc(db, 'profiles', profileId), profObjToMerge).then(() => {
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
    if (deleteExistingPhoto || profileEditedPhoto) {
      const storage = getStorage();

      // Submit new profile picture to Storage and get/save link, and remove old one
      if (profile.imgLink) {
        const oldImgRef = ref(storage, profile.imgLink);
        deleteObject(oldImgRef);
      }
      
      if (profileEditedPhoto) {
        const imgRef = ref(storage, uuidv4());
        uploadBytes(imgRef, profileEditedPhoto).then(snapshot => {
          getDownloadURL(snapshot.ref).then(url => { 
            mergeProfileProperty({ imgLink: url });
          });
        });
      } else {
        mergeProfileProperty({ imgLink: '' });
      }
    }
    
    // Submit new profile name
    if (profileEditedName) {
      mergeProfileProperty({ firstName: profileEditedName });
    }

    setProfileEditedName(profile.firstName);
    setProfileEditedPhoto(null);
    setEditingProfile(false);
    setDeleteExistingPhoto(false);
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
    const newMembers = [...family.members];
    const curUserIdx = newMembers.findIndex(mem => mem === userId);
    newMembers.splice(curUserIdx, 1);

    // Make first member in family new headOfFamily (if curUser is hoF)
    const mergeFam = { members: newMembers };
    if (family.headOfFamily === userId) {
      mergeFam.headOfFamily = newMembers[0];
    }

    updateDoc(doc(db, 'families', profile.familyId), mergeFam);
    mergeProfileProperty({ familyId: '' });
  };

  const copyInviteLink = () => {
    copy(`https://our-home-239c1.firebaseapp.com/joinFamily/${profile.familyId}`);
    setCopiedInviteLink(true);
  };

  useEffect(() => {
    if (family) getFamilyMemberProfiles();
  }, [family]);

  return (
    <Container maxWidth='md'>
      <Paper sx={{ mb: 4, p: 3 }}>
        <Typography variant='h2'>My Profile</Typography>

        <Stack alignItems='center' justifyContent='center'>
          <Avatar src={profile.imgLink ? profile.imgLink : null} alt='profile' sx={{ width: 164, height: 164 }}>
            {profile.imgLink ? null : <Typography variant='h1'>{profile.firstName[0].toUpperCase()}</Typography>}
          </Avatar>
          
          <Typography variant='h5' mt={1} mb={2}>{profile.firstName}</Typography>
          
          <Button variant='outlined' startIcon={<Edit />} onClick={() => setEditingProfile(true)}>Edit Profile</Button>

          <Dialog open={editingProfile} onClose={() => setEditingProfile(false)} fullWidth>
            <DialogTitle>Edit Profile</DialogTitle>

            <DialogContent>
              <TextField
                autoFocus
                variant='standard'
                label='First Name'
                value={profileEditedName}
                onChange={(event) => setProfileEditedName(event.target.value)}
              />

              <InputLabel sx={{ mt: 4, mb: 1 }}>Profile Photo</InputLabel>
              { !deleteExistingPhoto && 
                <DropzoneArea
                  acceptedFiles={['image/jpeg', 'image/png']}
                  filesLimit={1}
                  onChange={(files) => setProfileEditedPhoto(files[0])}
                  
                />
              }
              { profile.imgLink && <FormControlLabel control={<Checkbox checked={deleteExistingPhoto} onChange={() => setDeleteExistingPhoto(!deleteExistingPhoto)} />} label='Delete existing photo' /> }
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

          <Box mt={1} mb={4}>
            <Stack direction='row' alignItems='center'>
              <Typography variant='h5'>Family Name</Typography>
              {userId === family.headOfFamily && 
                <IconButton><Edit /></IconButton>
              }
            </Stack>

            <Typography variant='h6'>{family.name}</Typography>
          </Box>

          <Box mb={4}>
            <Typography variant='h5'>Members</Typography>
            <Stack direction='row' mb={3}>
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
              <Box width='100%' mx='auto'>
                <Button variant='contained' startIcon={<ContentCopyOutlined />} onClick={copyInviteLink}>Copy family invite link</Button>
                <Snackbar open={copiedInviteLink} autoHideDuration={2000} onClose={() => setCopiedInviteLink(false)} message='Copied invite link' />
              </Box>
            }
          </Box>

          <Box>
            <Typography variant='h5'>Pets</Typography>
            <Stack direction='row' mb={3}>
              {family.pets && family.pets.map(pet =>
                <Stack key={pet.name} alignItems='center' justifyContent='center'>
                  <Typography variant='body1'>{pet.name}</Typography>
                  <Avatar src={pet.imgLink ? pet.imgLink : null} alt='pet' sx={{ width: 96, height: 96 }}>{pet.imgLink ? null : pet.name[0].toUpperCase()}</Avatar>
                  {userId === family.headOfFamily &&
                    <Box>
                      <Button variant='outlined' startIcon={<Edit />}>Edit</Button>
                      <Button variant='outlined' startIcon={<Close />}>Remove</Button>
                    </Box>
                  }
                </Stack>
              )}
            </Stack>
            {userId === family.headOfFamily &&
              <Button variant='contained' startIcon={<Add />}>Add a pet</Button>
            }
          </Box>

          {userId === family.headOfFamily && 
            <Box mt={4}>
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
              
              <Box mb={2}>
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
              </Box>

              <Box mb={6}>
                <Stack direction='row' alignItems='center'>
                  <Typography variant='h6'>Location</Typography>
                  <IconButton><Edit /></IconButton>
                </Stack>
                {family.location &&
                  <Box>
                    <Box>
                      <Typography variant='body1'>Latitude: {family.location.lat}</Typography>
                      <Typography variant='body1'>Longitude: {family.location.long}</Typography>
                    </Box>
                    {family.gmaps_api_key && 
                      <MapPicker
                        defaultLocation={{ lat: parseFloat(family.location.lat), lng: parseFloat(family.location.long) }}
                        style={{ height: 500, width: 750 }}
                        onChangeLocation={(newLat, newLong) => { console.log(newLat + ' ' + newLong) }}
                        apiKey={family.gmaps_api_key}
                      />
                    }
                  </Box>
                }
              </Box>
            </Box>
          }

          {userId === family.headOfFamily ? (
            <Button variant='contained' color='error' startIcon={<Close />} onClick={() => setDeletingFamily(true)}>Delete Family</Button>
          ) : (
            <Button variant='contained' color='error' startIcon={<Logout />} onClick={() => setLeavingFamily(true)}>Leave Family</Button>
          )}

          <Dialog open={deletingFamily} onClose={() => setDeletingFamily(false)} fullWidth>
            <DialogTitle>Delete family?</DialogTitle>
            <DialogContent>
              <DialogContentText>Are you sure you want to delete the {family.name} family?</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button variant='text' onClick={() => setDeletingFamily(false)}>Cancel</Button>
              <Button variant='contained' onClick={deleteFamily}>Delete</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={leavingFamily} onClose={() => setLeavingFamily(false)} fullWidth>
            <DialogTitle>Leave family?</DialogTitle>
            <DialogContent>
              <DialogContentText>Are you sure you want to leave the {family.name} family?</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button variant='text' onClick={() => setLeavingFamily(false)}>Cancel</Button>
              <Button variant='contained' onClick={leaveFamily}>Leave</Button>
            </DialogActions>
          </Dialog>
        </Paper>
      )}
    </Container>
  );
}

export default Profile;
