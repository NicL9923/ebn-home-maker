import { useCallback, useEffect, useRef, useState } from 'react';
import EditableLabel from './Inputs/EditableLabel';
import { MdAdd, MdArticle, MdClose, MdContentCopy, MdLogout, MdMoreVert } from 'react-icons/md';
import { Profile, Pet, FamilySettings } from '../models/types';
import copy from 'clipboard-copy';
import NoFamily from './NoFamily';
import AddPet from './Forms/AddPet';
import { deleteObject, getStorage, ref } from 'firebase/storage';
import { useUserStore } from '../state/UserStore';
import { doc, getDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db, FsCol } from '../firebase';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  Checkbox,
  Divider,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
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

const isProfile = (obj: Profile | Pet): obj is Profile => (obj as Profile).firstName !== undefined;

const Family = () => {
  const toast = useToast();

  const userId = useUserStore((state) => state.userId);
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const [familyMemberProfiles, setFamilyMemberProfiles] = useState<Profile[]>([]);
  const [addingPet, setAddingPet] = useState(false);
  const [deletingFamily, setDeletingFamily] = useState(false);
  const [leavingFamily, setLeavingFamily] = useState(false);
  const [memberGettingRemoved, setMemberGettingRemoved] = useState<Profile | Pet>();
  const cancelRef = useRef(null);

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

    const newMembersArr = [...family.members];
    newMembersArr.splice(
      newMembersArr.findIndex((memberId) => memberId === memberProfile.uid),
      1
    );

    // TODO: Need to batch update this and that users profile.familyId
    updateDoc(doc(db, FsCol.Families, profile.familyId), { members: newMembersArr });
  };

  const removePet = (pet: Pet) => {
    if (!profile || !family) return;

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
                <Card variant='elevated' size='sm'>
                  <CardBody>
                    <Stack align='center'>
                      <Stack direction='row' justifyContent='space-between' align='center' mb={3}>
                        <Text fontSize={16}>{memberProfile.firstName}</Text>

                        {userId === family.headOfFamily && (
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              aria-label='Options'
                              icon={<MdMoreVert />}
                              variant='ghost'
                              size='sm'
                              fontSize={18}
                            />
                            <MenuList>
                              <MenuItem onClick={() => removeFamilyMember(memberProfile)}>Remove from family</MenuItem>
                            </MenuList>
                          </Menu>
                        )}
                      </Stack>

                      <Avatar name={memberProfile.firstName} src={memberProfile.imgLink} size='xl' />
                    </Stack>
                  </CardBody>
                </Card>
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
                <Card variant='elevated' size='sm'>
                  <CardBody>
                    <Stack align='center'>
                      <Stack direction='row' justifyContent='space-between' align='center' mb={3}>
                        <Text fontSize={16}>{pet.name}</Text>

                        {userId === family.headOfFamily && (
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              aria-label='Options'
                              icon={<MdMoreVert />}
                              variant='ghost'
                              size='sm'
                              fontSize={18}
                            />
                            <MenuList>
                              <MenuItem onClick={() => removePet(pet)}>Remove from family</MenuItem>
                            </MenuList>
                          </Menu>
                        )}
                      </Stack>

                      <Avatar name={pet.name} src={pet.imgLink} size='xl' />
                    </Stack>
                  </CardBody>
                </Card>
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
            current month (disabling this will allow scrolling to past and future months to see their transactions, but
            note that your current income/allotted values and categories will apply to all months)
          </Text>
        </Box>
      )}

      {userId === family.headOfFamily ? (
        <Stack spacing={5} mt={6}>
          {/* TODO: Need a method to regen familyId (in case accidentally released - to stop unwanted family joins) */}

          <Box>
            <Button leftIcon={<MdArticle />} onClick={exportFamilyDataJSON}>
              Export family data
            </Button>

            <Text>
              Export a copy of your current family data as JSON (still pretty readable to non-programmers!), currently
              including the name, members and pets, city/state, and your Family Board
            </Text>
          </Box>

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

      <AlertDialog
        isOpen={!!memberGettingRemoved}
        leastDestructiveRef={cancelRef}
        onClose={() => setMemberGettingRemoved(undefined)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Remove from family
            </AlertDialogHeader>

            <AlertDialogBody>{`Are you sure you want to remove ${
              memberGettingRemoved &&
              (isProfile(memberGettingRemoved) ? memberGettingRemoved.firstName : memberGettingRemoved.name)
            } from the family?`}</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setMemberGettingRemoved(undefined)}>
                Cancel
              </Button>
              <Button
                colorScheme='red'
                onClick={() => {
                  if (memberGettingRemoved) {
                    if (isProfile(memberGettingRemoved)) {
                      removeFamilyMember(memberGettingRemoved);
                    } else {
                      removePet(memberGettingRemoved);
                    }
                  }

                  setMemberGettingRemoved(undefined);
                }}
                ml={3}
              >
                Remove
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Family;
