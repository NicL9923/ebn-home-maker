import { useCallback, useEffect, useState } from 'react';
import EditableLabel from './Inputs/EditableLabel';
import { MdAdd, MdArticle, MdClose, MdContentCopy, MdLogout } from 'react-icons/md';
import { Profile, Pet, FamilySettings } from '../models/types';
import copy from 'clipboard-copy';
import NoFamily from './NoFamily';
import AddPet from './Forms/AddPet';
import { deleteObject, getStorage, ref } from 'firebase/storage';
import { useUserStore } from '../state/UserStore';
import { doc, getDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db, FsCol } from '../firebase';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Divider,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useToast,
  Wrap,
  WrapItem,
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

  const batch = writeBatch(db);

  const getFamilyMemberProfiles = useCallback(() => {
    if (!family?.members) return;

    const famMemProfs: Profile[] = [];

    family.members.forEach((memberId) => {
      if (memberId !== userId) {
        getDoc(doc(db, FsCol.Profiles, memberId)).then((doc) => {
          if (doc.exists()) {
            famMemProfs.push(doc.data() as Profile);
            setFamilyMemberProfiles(famMemProfs);
          }
        });
      }
    });
  }, [userId, family?.members]);

  const updateFamilyName = (newFamName?: string) => {
    if (profile && newFamName) {
      updateDoc(doc(db, FsCol.Families, profile.familyId), { name: newFamName });
    }
  };

  const updateFamilyLocation = (newCity = '', newState = '') => {
    if (!family || !profile) return;

    const curLoc = family.cityState.split(',');
    const newLoc = `${newCity ? newCity : curLoc[0]},${newState ? newState : curLoc[1]}`;

    updateDoc(doc(db, FsCol.Families, profile.familyId), { cityState: newLoc });
  };

  const updateFamilySettings = (newFamilySettings?: FamilySettings) => {
    if (family && newFamilySettings && profile) {
      updateDoc(doc(db, FsCol.Families, profile.familyId), { settings: { ...family.settings, ...newFamilySettings } });
    }
  };

  const deleteFamily = () => {
    if (!userId || !profile || !family) return;

    // Set each profile in family.members familyId property to ''
    family.members.forEach((member) => {
      batch.update(doc(db, FsCol.Profiles, member), { familyId: '' });
    });

    // Delete residences and vehicles
    family.residences.forEach((resId) => {
      batch.delete(doc(db, FsCol.Residences, resId));
    });

    family.vehicles.forEach((vehId) => {
      batch.delete(doc(db, FsCol.Vehicles, vehId));
    });

    // Delete family doc
    batch.delete(doc(db, FsCol.Families, profile.familyId));
    batch.update(doc(db, FsCol.Profiles, userId), { familyId: '' });

    batch.commit();
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

    batch.commit();
  };

  const copyInviteLink = () => {
    if (!profile) return;

    copy(`https://explorersbynature.com/joinFamily/${profile.familyId}`).then(() => {
      toast({
        title: `Copied invite link`,
        status: 'info',
        isClosable: true,
      });
    });
  };

  const removeFamilyMember = (memberProfile: Profile) => {
    if (!profile || !family) return;

    if (window.confirm(`Are you sure you want to remove ${memberProfile.firstName} from the family?`)) {
      const newMembersArr = [...family.members];
      newMembersArr.splice(
        newMembersArr.findIndex((memberId) => memberId === memberProfile.uid),
        1
      );

      // TODO: Need to batch update this and that users profile.familyId
      updateDoc(doc(db, FsCol.Families, profile.familyId), { members: newMembersArr });
    }
  };

  const removePet = (pet: Pet) => {
    if (!profile || !family) return;

    if (window.confirm(`Are you sure you want to remove ${pet.name} from the family?`)) {
      const newPetsArr = [...family.pets];
      newPetsArr.splice(
        newPetsArr.findIndex((petInArr) => petInArr.uid === pet.uid),
        1
      );

      if (pet.imgLink) {
        const storage = getStorage();
        const oldImgRef = ref(storage, pet.imgLink);
        deleteObject(oldImgRef);
      }

      updateDoc(doc(db, FsCol.Families, profile.familyId), { pets: newPetsArr });
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
  }, [family, getFamilyMemberProfiles]);

  if (!profile) {
    return null;
  }

  if (!family) {
    return <NoFamily />;
  }

  return (
    <Box p={3}>
      <Heading>My Family</Heading>

      <Box mt={1} mb={4}>
        <Text>Family Name</Text>

        {userId === family.headOfFamily ? (
          <EditableLabel
            textSize='xl'
            text={family.name}
            fieldName='Family Name'
            fieldType='EntityName'
            onSubmitValue={updateFamilyName}
          />
        ) : (
          <Text>{family.name}</Text>
        )}
      </Box>

      <Box mb={4}>
        <Heading size='md' mb={2}>
          Members
        </Heading>
        <Wrap>
          {familyMemberProfiles &&
            familyMemberProfiles.map((memberProfile) => (
              <WrapItem key={memberProfile.uid}>
                <Stack alignItems='center' justifyContent='center'>
                  <Text>{memberProfile.firstName}</Text>
                  <Avatar name={memberProfile.firstName} src={memberProfile.imgLink} size='2xl' />
                  {userId === family.headOfFamily && (
                    <Button
                      leftIcon={<MdClose />}
                      mt='2'
                      size='sm'
                      onClick={() => removeFamilyMember(memberProfile)}
                      colorScheme='red'
                    >
                      Remove
                    </Button>
                  )}
                </Stack>
              </WrapItem>
            ))}
        </Wrap>

        {userId === family.headOfFamily && (
          <Button leftIcon={<MdContentCopy />} onClick={copyInviteLink} mt={3}>
            Copy family invite link
          </Button>
        )}
      </Box>

      <Box>
        <Heading size='md' mb={2}>
          Pets
        </Heading>
        <Wrap>
          {family.pets &&
            family.pets.map((pet: Pet) => (
              <WrapItem key={pet.uid}>
                <Stack alignItems='center' justifyContent='center'>
                  <Text>{pet.name}</Text>
                  <Avatar name={pet.name} src={pet.imgLink} size='xl' />
                  {userId === family.headOfFamily && (
                    <Button leftIcon={<MdClose />} size='sm' onClick={() => removePet(pet)} mt='2' colorScheme='red'>
                      Remove
                    </Button>
                  )}
                </Stack>
              </WrapItem>
            ))}
        </Wrap>

        {userId === family.headOfFamily && (
          <Button leftIcon={<MdAdd />} onClick={() => setAddingPet(true)} mt={3}>
            Add a pet
          </Button>
        )}
      </Box>

      {userId === family.headOfFamily && (
        <Box mt={4}>
          <Divider />

          <Heading size='md' mt={2} mb={2}>
            Weather Applet - Location
          </Heading>

          <Heading size='sm'>City</Heading>
          <EditableLabel
            text={family.cityState ? family.cityState.split(',')[0] : ''}
            fieldName='City'
            fieldType='EntityName'
            onSubmitValue={updateFamilyLocation}
          />

          <Heading size='sm'>State</Heading>
          <EditableLabel
            text={family.cityState ? family.cityState.split(',')[1] : ''}
            fieldName='State'
            fieldType='EntityName'
            onSubmitValue={(newState?: string) => updateFamilyLocation('', newState)}
          />
        </Box>
      )}

      {userId === family.headOfFamily && (
        <Box mt={4}>
          <Divider />

          <Heading size='md' mt={2} mb={2}>
            Family Settings
          </Heading>

          <Checkbox
            defaultChecked={!!family.settings?.showAllTransactionsOnCurrentMonth}
            onChange={(event) => updateFamilySettings({ showAllTransactionsOnCurrentMonth: event.target.checked })}
            size='lg'
          >
            Show all transactions on current month
          </Checkbox>
          <Text>
            Include all transactions in the current month&apos;s budget calculations even if they occurred outside the
            current month
          </Text>
        </Box>
      )}

      {userId === family.headOfFamily ? (
        <Stack spacing={5} mt={6}>
          {/* TODO: Need a method to regen familyId (in case accidentally released - to stop unwanted family joins) */}

          <Button leftIcon={<MdArticle />} onClick={exportFamilyDataJSON}>
            Export family data
          </Button>

          <Button colorScheme='red' leftIcon={<MdClose />} onClick={() => setDeletingFamily(true)}>
            Delete Family
          </Button>
        </Stack>
      ) : (
        <Button leftIcon={<MdLogout />} onClick={() => setLeavingFamily(true)} mt={6} colorScheme='red'>
          Leave Family
        </Button>
      )}

      <AddPet isOpen={addingPet} setIsOpen={setAddingPet} />

      <Modal isOpen={deletingFamily} onClose={() => setDeletingFamily(false)}>
        <ModalOverlay />

        <ModalContent>
          <ModalHeader>Delete family?</ModalHeader>
          <ModalBody>
            <Text>Are you sure you want to delete the {family.name} family?</Text>
          </ModalBody>

          <ModalFooter>
            <Button onClick={() => setDeletingFamily(false)}>Cancel</Button>
            <Button onClick={deleteFamily}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={leavingFamily} onClose={() => setLeavingFamily(false)}>
        <ModalOverlay />

        <ModalContent>
          <ModalHeader>Leave family?</ModalHeader>

          <ModalBody>
            <Text>Are you sure you want to leave the {family.name} family?</Text>
          </ModalBody>

          <ModalFooter>
            <Button onClick={() => setLeavingFamily(false)}>Cancel</Button>
            <Button onClick={leaveFamily}>Leave</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Family;
