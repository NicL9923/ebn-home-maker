import React, { useEffect, useState } from 'react';
import EditableLabel from './Inputs/EditableLabel';
import { MdAdd, MdClose, MdContentCopy, MdLogout } from 'react-icons/md';
import { Profile, Pet } from 'models/types';
import copy from 'clipboard-copy';
import NoFamily from './NoFamily';
import AddPet from './Forms/AddPet';
import { deleteObject, getStorage, ref } from 'firebase/storage';
import { useUserStore } from 'state/UserStore';
import { useFirestoreDocumentMutation, useFirestoreWriteBatch } from '@react-query-firebase/firestore';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { db, FsCol } from '../firebase';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';

const Family = () => {
  const toast = useToast();

  const userId = useUserStore((state) => state.userId);
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const [familyMemberProfiles, setFamilyMemberProfiles] = useState<Profile[]>([]);
  const [addingPet, setAddingPet] = useState(false);
  const [deletingFamily, setDeletingFamily] = useState(false);
  const [leavingFamily, setLeavingFamily] = useState(false);

  const familyDocMutation = useFirestoreDocumentMutation(doc(db, FsCol.Families, profile?.familyId ?? 'undefined'), {
    merge: true,
  });

  const batch = writeBatch(db);
  const batchMutation = useFirestoreWriteBatch(batch);

  const getFamilyMemberProfiles = () => {
    if (!family?.members) return;

    const famMemProfs: Profile[] = [];

    family.members.forEach((member) => {
      if (member !== userId) {
        getDoc(doc(db, FsCol.Profiles, member)).then((doc) => {
          if (doc.exists()) {
            famMemProfs.push(doc.data() as Profile);
            setFamilyMemberProfiles(famMemProfs);
          }
        });
      }
    });
  };

  const updateFamilyName = (newFamName?: string) => {
    if (newFamName) {
      familyDocMutation.mutate({ name: newFamName });
    }
  };

  const updateFamilyLocation = (newCity = '', newState = '') => {
    if (!family) return;

    const curLoc = family.cityState.split(',');
    const newLoc = `${newCity ? newCity : curLoc[0]},${newState ? newState : curLoc[1]}`;

    familyDocMutation.mutate({ cityState: newLoc });
  };

  const deleteFamily = () => {
    if (!userId || !profile || !family) return;

    // Set each profile in family.members familyId property to ''
    family.members.forEach((member) => {
      batch.update(doc(db, FsCol.Profiles, member), { familyId: '' });
    });

    // Delete residences and vehicles
    family.residences.forEach((res) => {
      batch.delete(doc(db, FsCol.Residences, res));
    });

    family.vehicles.forEach((veh) => {
      batch.delete(doc(db, FsCol.Vehicles, veh));
    });

    // Delete family doc
    batch.delete(doc(db, FsCol.Families, profile.familyId));
    batch.update(doc(db, FsCol.Profiles, userId), { familyId: '' });

    batchMutation.mutate();
  };

  const leaveFamily = () => {
    if (!userId || !profile || !family) return;

    const newMembers = [...family.members];
    const curUserIdx = newMembers.findIndex((mem) => mem === userId);
    newMembers.splice(curUserIdx, 1);

    // Make first member in family new headOfFamily (if curUser is hoF)
    const mergeFam = { members: newMembers, headOfFamily: family.headOfFamily };
    if (family.headOfFamily === userId) {
      mergeFam.headOfFamily = newMembers[0];
    }

    batch.update(doc(db, FsCol.Families, profile.familyId), mergeFam);
    batch.update(doc(db, FsCol.Profiles, userId), { familyId: '' });

    batchMutation.mutate();
  };

  const copyInviteLink = () => {
    if (!profile) return;

    copy(`https://our-home-239c1.firebaseapp.com/joinFamily/${profile.familyId}`).then(() => {
      toast({
        title: `Copied invite link`,
        status: 'info',
        isClosable: true,
      });
    });
  };

  const removeFamilyMember = (memberFirstName: string, memberIdx: number) => {
    if (!profile || !family) return;

    if (window.confirm(`Are you sure you want to remove ${memberFirstName} from the family?`)) {
      const newMembersArr = [...family.members];
      newMembersArr.splice(memberIdx, 1);

      familyDocMutation.mutate({ members: newMembersArr });
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

      familyDocMutation.mutate({ pets: newPetsArr });
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
      cityState: family.cityState,
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
    <Box p={3}>
      <Text variant='h3'>My Family</Text>

      <Box mt={1} mb={4}>
        <Text variant='h5'>Family Name</Text>

        {userId === family.headOfFamily ? (
          <EditableLabel
            textVariant='h6'
            text={family.name}
            fieldName='Family Name'
            fieldType='EntityName'
            onSubmitValue={updateFamilyName}
          />
        ) : (
          <Text variant='h6'>{family.name}</Text>
        )}
      </Box>

      <Box mb={4}>
        <Text variant='h5'>Members</Text>
        <Stack direction='row' mb={3} flexWrap='wrap' spacing={1}>
          {familyMemberProfiles &&
            familyMemberProfiles.map((prof: Profile, idx: number) => (
              <Stack key={prof.firstName} alignItems='center' justifyContent='center'>
                <Text variant='h6'>{prof.firstName}</Text>
                <Avatar src={prof.imgLink} sx={{ width: 128, height: 128 }}>
                  {!prof.imgLink && prof.firstName[0].toUpperCase()}
                </Avatar>
                {userId === family.headOfFamily && (
                  <Button
                    variant='outlined'
                    leftIcon={<MdClose />}
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
            <Button variant='contained' leftIcon={<MdContentCopy />} onClick={copyInviteLink}>
              Copy family invite link
            </Button>
          </Box>
        )}
      </Box>

      <Box>
        <Text variant='h5'>Pets</Text>
        <Stack direction='row' mb={3} flexWrap='wrap' spacing={1}>
          {family.pets &&
            family.pets.map((pet: Pet, idx: number) => (
              <Stack key={pet.name} alignItems='center' justifyContent='center'>
                <Text variant='body1'>{pet.name}</Text>
                <Avatar src={pet.imgLink} sx={{ width: 96, height: 96 }}>
                  {!pet.imgLink && pet.name[0].toUpperCase()}
                </Avatar>
                {userId === family.headOfFamily && (
                  <Button
                    variant='outlined'
                    leftIcon={<MdClose />}
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
          <Button variant='contained' leftIcon={<MdAdd />} onClick={() => setAddingPet(true)}>
            Add a pet
          </Button>
        )}
      </Box>

      {userId === family.headOfFamily && (
        <Box mt={4}>
          <Divider />

          <Text variant='h5' mt={2}>
            Weather Applet Information
          </Text>

          <Box mb={6}>
            <Text variant='h6'>Location</Text>

            <Box>
              <Text variant='body1'>City</Text>

              <EditableLabel
                textVariant='body1'
                text={family.cityState ? family.cityState.split(',')[0] : ''}
                fieldName='City'
                fieldType='EntityName'
                onSubmitValue={updateFamilyLocation}
              />
              <Text variant='body1'>State</Text>
              <EditableLabel
                textVariant='body1'
                text={family.cityState ? family.cityState.split(',')[1] : ''}
                fieldName='State'
                fieldType='EntityName'
                onSubmitValue={(newState?: string) => updateFamilyLocation('', newState)}
              />
            </Box>
          </Box>
        </Box>
      )}

      {userId === family.headOfFamily ? (
        <Stack spacing={5}>
          <Button variant='contained' onClick={exportFamilyDataJSON}>
            Export family data
          </Button>
          <Button variant='contained' color='error' leftIcon={<MdClose />} onClick={() => setDeletingFamily(true)}>
            Delete Family
          </Button>
        </Stack>
      ) : (
        <Button variant='contained' color='error' leftIcon={<MdLogout />} onClick={() => setLeavingFamily(true)}>
          Leave Family
        </Button>
      )}

      <Modal isOpen={deletingFamily} onClose={() => setDeletingFamily(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete family?</ModalHeader>
          <Text>Are you sure you want to delete the {family.name} family?</Text>

          <ModalFooter>
            <Button variant='text' onClick={() => setDeletingFamily(false)}>
              Cancel
            </Button>
            <Button variant='contained' onClick={deleteFamily}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={leavingFamily} onClose={() => setLeavingFamily(false)}>
        <ModalHeader>Leave family?</ModalHeader>
        <ModalContent>
          <Text>Are you sure you want to leave the {family.name} family?</Text>

          <ModalFooter>
            <Button variant='text' onClick={() => setLeavingFamily(false)}>
              Cancel
            </Button>
            <Button variant='contained' onClick={leaveFamily}>
              Leave
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AddPet isOpen={addingPet} setIsOpen={setAddingPet} />
    </Box>
  );
};

export default Family;
