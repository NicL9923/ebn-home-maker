import {
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
  Stack,
  Text,
  Wrap,
  WrapItem,
  useToast
} from '@chakra-ui/react';
import copy from 'clipboard-copy';
import { format } from 'date-fns';
import { doc, getDoc } from 'firebase/firestore';
import { deleteObject, getStorage, ref } from 'firebase/storage';
import { useCallback, useEffect, useState } from 'react';
import { MdAdd, MdArticle, MdClose, MdContentCopy, MdLogout, MdMoreVert } from 'react-icons/md';
import Client from '../Client';
import { FsCol, db } from '../firebase';
import { FamilySettings, Pet, Profile, Residence, ServiceLogEntry, Vehicle } from '../models/types';
import { useUserStore } from '../state/UserStore';
import ConfirmDialog from './ConfirmDialog';
import AddOrEditPet from './Forms/AddOrEditPet';
import { catSubcatKeySeparator } from './Forms/AddOrEditTransaction';
import EditableLabel from './Inputs/EditableLabel';
import NoFamily from './NoFamily';

const isProfile = (obj: Profile | Pet): obj is Profile => (obj as Profile).firstName !== undefined;

const Family = () => {
  const toast = useToast();

  const userId = useUserStore((state) => state.userId);
  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const [familyMemberProfiles, setFamilyMemberProfiles] = useState<Profile[]>([]);
  const [addingOrEditingPet, setAddingOrEditingPet] = useState(false);
  const [petToEdit, setPetToEdit] = useState<Pet>();
  const [deletingFamily, setDeletingFamily] = useState(false);
  const [leavingFamily, setLeavingFamily] = useState(false);
  const [memberGettingRemoved, setMemberGettingRemoved] = useState<Profile | Pet>();

  const getFamilyMemberProfiles = useCallback(async () => {
    if (!family?.members) return;

    const famMemProfs: Profile[] = [];

    const famMemDocs = await Promise.all(family.members.flatMap((memberId) => memberId !== userId ? [getDoc(doc(db, FsCol.Profiles, memberId))] : []));

    famMemDocs.forEach((famMemDoc) => {
      if (famMemDoc.exists()) {
        famMemProfs.push(famMemDoc.data() as Profile);
      }
    });

    setFamilyMemberProfiles(famMemProfs);
  }, [userId, family?.members]);

  const updateFamilyName = (newFamName?: string) => {
    if (profile && newFamName) {
      Client.updateFamily(profile.familyId, { name: newFamName });
    }
  };

  /*const updateFamilyLocation = (newCity = '', newState = '') => {
    if (!family || !profile) return;

    const curLoc = family.cityState.split(',');
    const newLoc = `${newCity ? newCity : curLoc[0]},${newState ? newState : curLoc[1]}`;

    Client.updateFamily(profile.familyId, { cityState: newLoc });
  };*/

  const updateFamilySettings = (newFamilySettings?: FamilySettings) => {
    if (family && newFamilySettings && profile) {
      Client.updateFamily(profile.familyId, { settings: { ...family.settings, ...newFamilySettings } });
    }
  };

  const deleteFamily = () => {
    if (!userId || !profile || !family) return;

    Client.deleteFamily(userId, profile.familyId, family);
  };

  const leaveFamily = () => {
    if (!userId || !profile || !family) return;

    Client.leaveFamily(userId, profile.familyId, family);
  };

  const copyInviteLink = async () => {
    if (!profile) return;

    await copy(`https://explorersbynature.com/joinFamily/${profile.familyId}`);

    toast({
      title: `Copied invite link`,
      status: 'info',
      isClosable: true,
    });
  };

  const removeFamilyMember = (memberProfile: Profile) => {
    if (!profile || !family) return;

    Client.leaveFamily(memberProfile.uid, profile.familyId, family);
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

    Client.updateFamily(profile.familyId, { pets: newPetsArr });
  };

  const exportFamilyDataJSON = async () => {
    if (!family || !profile) return;

    const fileName = `HomeMakerFamilyData-${format(Date.now(), 'MM-dd-yyyy')}`;

    // Compile data
    const residences: Residence[] = [];
    const residenceDocs = await Promise.all(family.residences.map((residence) => getDoc(doc(db, FsCol.Residences, residence))));
    residenceDocs.forEach((resDoc) => {
      if (resDoc.exists()) {
        const docData = resDoc.data();
        docData.serviceLogEntries.forEach((entry: ServiceLogEntry) => {
          entry.date = new Date(entry.date).toLocaleDateString();
        });
        residences.push(docData as Residence);
      }
    });

    const vehicles: Vehicle[] = [];
    const vehicleDocs = await Promise.all(family.vehicles.map((vehicle) => getDoc(doc(db, FsCol.Vehicles, vehicle))));
    vehicleDocs.forEach((vehDoc) => {
      if (vehDoc.exists()) {
        const docData = vehDoc.data();
        docData.serviceLogEntries.forEach((entry: ServiceLogEntry) => {
          entry.date = new Date(entry.date).toLocaleDateString();
        });
        vehicles.push(docData as Vehicle);
      }
    });

    const familyData = {
      name: family.name,
      members: [profile, ...familyMemberProfiles],
      pets: family.pets,
      groceryListSections: family.groceryList.filter(item => item.uid.startsWith(catSubcatKeySeparator)).map(item => item.name),
      boardMarkdown: family.boardMarkdown,
      residences,
      vehicles,
      settings: family.settings,
    };

    // Compile file
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
          {family.pets?.map((pet: Pet) => (
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
                            <MenuItem
                              onClick={() => {
                                setPetToEdit({...pet });
                                setAddingOrEditingPet(true);
                              }}
                            >
                              Edit
                            </MenuItem>
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
          <Button leftIcon={<MdAdd />} onClick={() => setAddingOrEditingPet(true)} mt={3}>
            Add a pet
          </Button>
        )}
      </Box>

      {/*userId === family.headOfFamily && (
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
      )*/}

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
          <Text fontSize='xs'>
            Include all transactions in the current month&apos;s budget calculations even if they occurred outside the
            current month. Disabling this will allow scrolling to past and future months to see their transactions (note that your current income/allotted values and categories will be the same across all months)
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

            <Text fontSize='xs'>
              Export a copy of your current family data as JSON (still pretty readable to non-programmers!), not including
              finance data which can be exported separately on that page
            </Text>
          </Box>

          <Button colorScheme='red' leftIcon={<MdClose />} onClick={() => setDeletingFamily(true)}>
            Delete family
          </Button>
        </Stack>
      ) : (
        <Button leftIcon={<MdLogout />} onClick={() => setLeavingFamily(true)} mt={6} colorScheme='red'>
          Leave Family
        </Button>
      )}

      <AddOrEditPet isOpen={addingOrEditingPet} setIsOpen={setAddingOrEditingPet} existingPet={petToEdit} />

      <ConfirmDialog
        title='Delete family'
        text={`Are you sure you want to delete the ${family.name} family?`}
        primaryActionText='Delete'
        isOpen={deletingFamily}
        onClose={(confirmed) => {
          if (confirmed) {
            deleteFamily();
          }

          setDeletingFamily(false);
        }}
      />

      <ConfirmDialog
        title='Leave family'
        text={`Are you sure you want to leave the ${family.name} family?`}
        primaryActionText='Leave'
        isOpen={leavingFamily}
        onClose={(confirmed) => {
          if (confirmed) {
            leaveFamily();
          }

          setLeavingFamily(false);
        }}
      />

      <ConfirmDialog
        title='Remove from family'
        text={`Are you sure you want to remove ${
          memberGettingRemoved &&
          (isProfile(memberGettingRemoved) ? memberGettingRemoved.firstName : memberGettingRemoved.name)
        } from the family?`}
        primaryActionText='Remove'
        isOpen={!!memberGettingRemoved}
        onClose={(confirmed) => {
          if (confirmed && memberGettingRemoved) {
            if (isProfile(memberGettingRemoved)) {
              removeFamilyMember(memberGettingRemoved);
            } else {
              removePet(memberGettingRemoved);
            }
          }

          setMemberGettingRemoved(undefined);
        }}
      />
    </Box>
  );
};

export default Family;
