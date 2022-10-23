import React, { useContext, useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import EditableLabel from './Inputs/EditableLabel';
import { Add, Close, ContentCopyOutlined, Logout } from '@mui/icons-material';
import { UserProfile, Pet } from 'models/types';
import { UserContext, AppContext } from 'providers/AppProvider';
import { FirebaseContext } from 'providers/FirebaseProvider';
import copy from 'clipboard-copy';
import NoFamily from './NoFamily';
import AddPet from './Forms/AddPet';
import { deleteObject, getStorage, ref } from 'firebase/storage';

/*const obtainGmapsApiKeyText = `Obtain and input a Google Maps API key if you would like
to use the built-in location picker, otherwise manually find/input
your location's coordinates`;*/

const obtainOwmApiKeyText = `Obtain and input an OpenWeatherMap 'Current Weather' API key,
and set your family's location below, if you would like to see
your local weather forecast on the homepage`;

interface FamilyProps {
  mergeProfileProperty: (profObjToMerge: Partial<UserProfile>, profileId?: string, refreshProfile?: boolean) => void;
}

const Family = ({ mergeProfileProperty }: FamilyProps) => {
  const { setSnackbarData } = useContext(AppContext);
  const firebase = useContext(FirebaseContext);
  const { userId, profile, family, getFamily } = useContext(UserContext);

  const [familyMemberProfiles, setFamilyMemberProfiles] = useState<UserProfile[]>([]);
  const [addingPet, setAddingPet] = useState(false);
  const [deletingFamily, setDeletingFamily] = useState(false);
  const [leavingFamily, setLeavingFamily] = useState(false);

  const getFamilyMemberProfiles = () => {
    if (!family?.members) return;

    const famMemProfs: UserProfile[] = [];

    family.members.forEach((member) => {
      if (member === userId) return;

      firebase.getProfile(member).then((doc) => {
        if (doc.exists()) {
          const profileData = doc.data() as UserProfile;
          famMemProfs.push(profileData);
          setFamilyMemberProfiles(famMemProfs);
        } else {
          // Specified family member doesn't exist
        }
      });
    });
  };

  const updateFamilyName = (newFamName?: string) => {
    if (!profile || !newFamName) return;

    firebase.updateFamily(profile.familyId, { name: newFamName }).then(getFamily);
  };

  /*const updateGmapsApiKey = (newApiKey?: string) => {
    if (!profile || !newApiKey) return;

    firebase.updateFamily(profile.familyId, { gmaps_api_key: newApiKey }).then(getFamily);
  };*/

  const updateOwmApiKey = (newApiKey?: string) => {
    if (!profile || !newApiKey) return;

    firebase.updateFamily(profile.familyId, { openweathermap_api_key: newApiKey }).then(getFamily);
  };

  const updateFamilyLocation = (newLat = '', newLong = '') => {
    if (!profile || !family) return;

    const newLoc = {
      lat: newLat ?? family.location?.lat,
      long: newLong ?? family.location?.long,
    };

    firebase.updateFamily(profile.familyId, { location: newLoc }).then(getFamily);
  };

  const deleteFamily = () => {
    if (!profile || !family) return;

    // Set each profile in family.members familyId property to ''
    if (family.members) {
      family.members.forEach((member) => {
        mergeProfileProperty({ familyId: '' }, member, false);
      });
    }

    // Delete residences and vehicles
    if (family.residences) {
      family.residences.forEach((res) => {
        firebase.deleteResidence(res);
      });
    }

    if (family.vehicles) {
      family.vehicles.forEach((veh) => {
        firebase.deleteVehicle(veh);
      });
    }

    // Delete family doc
    firebase.deleteFamily(profile.familyId).then(() => {
      mergeProfileProperty({ familyId: '' });
    });
  };

  const leaveFamily = () => {
    if (!profile || !family) return;

    const newMembers = [...family.members];
    const curUserIdx = newMembers.findIndex((mem) => mem === userId);
    newMembers.splice(curUserIdx, 1);

    // Make first member in family new headOfFamily (if curUser is hoF)
    const mergeFam = { members: newMembers, headOfFamily: family.headOfFamily };
    if (family.headOfFamily === userId) {
      mergeFam.headOfFamily = newMembers[0];
    }

    firebase.updateFamily(profile.familyId, mergeFam);
    mergeProfileProperty({ familyId: '' });
  };

  const copyInviteLink = () => {
    if (!profile) return;

    copy(`https://our-home-239c1.firebaseapp.com/joinFamily/${profile.familyId}`).then(() => {
      setSnackbarData({ msg: 'Copied invite link', severity: 'info' });
    });
  };

  const removeFamilyMember = (memberFirstName: string, memberIdx: number) => {
    if (!profile || !family) return;

    if (window.confirm(`Are you sure you want to remove ${memberFirstName} from the family?`)) {
      const newMembersArr = [...family.members];
      newMembersArr.splice(memberIdx, 1);

      firebase.updateFamily(profile.familyId, { members: newMembersArr }).then(getFamily);
    }
  };

  const removePet = (pet: Pet, petIdx: number) => {
    if (!profile || !family) return;

    if (window.confirm(`Are you sure you want to remove ${pet.name} from the family?`)) {
      const newPetsArr = [...family.pets];
      newPetsArr.splice(petIdx, 1);

      if (pet.imgLink) {
        const storage = getStorage();
        const oldImgRef = ref(storage, pet.imgLink);
        deleteObject(oldImgRef);
      }

      firebase.updateFamily(profile.familyId, { pets: newPetsArr }).then(getFamily);
    }
  };

  const exportFamilyDataJSON = () => {
    if (!family) return;

    const fileName = 'FamilyData';
    const familyData = {
      name: family.name,
      members: family.members,
      pets: family.pets,
      boardMarkdown: family.boardMarkdown,
      location: family.location,
      apiKeys: {
        openWeather: family.openweathermap_api_key,
        gmaps: family.gmaps_api_key,
      },
    };

    const json = JSON.stringify(familyData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const href = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = href;
    link.download = fileName + '.json';
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  useEffect(() => {
    if (family) getFamilyMemberProfiles();
  }, [family]);

  if (!family) {
    return <NoFamily />;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant='h3'>My Family</Typography>

      <Box mt={1} mb={4}>
        <Typography variant='h5'>Family Name</Typography>

        {userId === family.headOfFamily ? (
          <EditableLabel
            textVariant='h6'
            text={family.name}
            fieldName='Family Name'
            fieldType='EntityName'
            onSubmitValue={updateFamilyName}
          />
        ) : (
          <Typography variant='h6'>{family.name}</Typography>
        )}
      </Box>

      <Box mb={4}>
        <Typography variant='h5'>Members</Typography>
        <Stack direction='row' mb={3} flexWrap='wrap' spacing={1}>
          {familyMemberProfiles &&
            familyMemberProfiles.map((prof: UserProfile, idx: number) => (
              <Stack key={prof.firstName} alignItems='center' justifyContent='center'>
                <Typography variant='h6'>{prof.firstName}</Typography>
                <Avatar src={prof.imgLink} alt='family member' sx={{ width: 128, height: 128 }}>
                  {!prof.imgLink && prof.firstName[0].toUpperCase()}
                </Avatar>
                {userId === family.headOfFamily && (
                  <Button
                    variant='outlined'
                    startIcon={<Close />}
                    sx={{ mt: 2 }}
                    size='small'
                    onClick={() => removeFamilyMember(prof.firstName, idx)}
                  >
                    Remove
                  </Button>
                )}
              </Stack>
            ))}
        </Stack>
        {userId === family.headOfFamily && (
          <Box width='100%' mx='auto'>
            <Button variant='contained' startIcon={<ContentCopyOutlined />} onClick={copyInviteLink}>
              Copy family invite link
            </Button>
          </Box>
        )}
      </Box>

      <Box>
        <Typography variant='h5'>Pets</Typography>
        <Stack direction='row' mb={3} flexWrap='wrap' spacing={1}>
          {family.pets &&
            family.pets.map((pet: Pet, idx: number) => (
              <Stack key={pet.name} alignItems='center' justifyContent='center'>
                <Typography variant='body1'>{pet.name}</Typography>
                <Avatar src={pet.imgLink} alt='pet' sx={{ width: 96, height: 96 }}>
                  {!pet.imgLink && pet.name[0].toUpperCase()}
                </Avatar>
                {userId === family.headOfFamily && (
                  <Button
                    variant='outlined'
                    startIcon={<Close />}
                    size='small'
                    onClick={() => removePet(pet, idx)}
                    sx={{ mt: 2 }}
                  >
                    Remove
                  </Button>
                )}
              </Stack>
            ))}
        </Stack>
        {userId === family.headOfFamily && (
          <Button variant='contained' startIcon={<Add />} onClick={() => setAddingPet(true)}>
            Add a pet
          </Button>
        )}
      </Box>

      {userId === family.headOfFamily && (
        <Box mt={4}>
          <Divider />
          <Typography variant='h5' mt={2}>
            Weather Applet Information
          </Typography>

          {/*<Stack mt={1} mb={2}>
            <Typography variant='h6'>Google Maps API Key</Typography>

            <EditableLabel
              textVariant='body1'
              text={family.gmaps_api_key ?? obtainGmapsApiKeyText}
              fieldName={'Google Maps API key'}
              fieldType='ApiToken'
              onSubmitValue={updateGmapsApiKey}
            />
          </Stack>*/}

          <Box mb={2}>
            <Typography variant='h6'>OpenWeatherMap API Key</Typography>

            <EditableLabel
              textVariant='body1'
              text={family.openweathermap_api_key ?? obtainOwmApiKeyText}
              fieldName='OpenWeatherMap API Key'
              fieldType='ApiToken'
              onSubmitValue={updateOwmApiKey}
            />
          </Box>

          <Box mb={6}>
            <Typography variant='h6'>Location</Typography>

            {family.location && (
              <Box>
                <Box>
                  <Typography variant='body1'>Latitude:</Typography>
                  <EditableLabel
                    textVariant='body1'
                    text={family.location.lat}
                    fieldName='Latitude'
                    fieldType='DecimalNum'
                    onSubmitValue={updateFamilyLocation}
                  />
                  <Typography variant='body1'>Longitude:</Typography>
                  <EditableLabel
                    textVariant='body1'
                    text={family.location.long}
                    fieldName='Longitude'
                    fieldType='DecimalNum'
                    onSubmitValue={(newLong?: string) => updateFamilyLocation('', newLong)}
                  />
                </Box>

                {/*family.gmaps_api_key && (
                  <MapPicker
                    googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${family.gmaps_api_key}&v=3.exp&libraries=geometry,drawing,places`}
                    loadingElement={<div style={{ height: `100%` }} />}
                    containerElement={<div style={{ height: 500 }} />}
                    mapElement={<div style={{ height: `100%` }} />}
                    familyLocation={family.location}
                    updateFamilyLocation={updateFamilyLocation}
                  />
                )*/}
              </Box>
            )}
          </Box>
        </Box>
      )}

      {userId === family.headOfFamily ? (
        <Stack spacing={5}>
          <Button variant='contained' onClick={exportFamilyDataJSON}>
            Export family data
          </Button>
          <Button variant='contained' color='error' startIcon={<Close />} onClick={() => setDeletingFamily(true)}>
            Delete Family
          </Button>
        </Stack>
      ) : (
        <Button variant='contained' color='error' startIcon={<Logout />} onClick={() => setLeavingFamily(true)}>
          Leave Family
        </Button>
      )}

      <Dialog open={deletingFamily} onClose={() => setDeletingFamily(false)} fullWidth>
        <DialogTitle>Delete family?</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete the {family.name} family?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant='text' onClick={() => setDeletingFamily(false)}>
            Cancel
          </Button>
          <Button variant='contained' onClick={deleteFamily}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={leavingFamily} onClose={() => setLeavingFamily(false)} fullWidth>
        <DialogTitle>Leave family?</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to leave the {family.name} family?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant='text' onClick={() => setLeavingFamily(false)}>
            Cancel
          </Button>
          <Button variant='contained' onClick={leaveFamily}>
            Leave
          </Button>
        </DialogActions>
      </Dialog>

      <AddPet isOpen={addingPet} setIsOpen={setAddingPet} />
    </Paper>
  );
};

export default Family;
