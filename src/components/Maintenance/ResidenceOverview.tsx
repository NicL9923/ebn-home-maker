import {
  AspectRatio,
  Box,
  Card,
  CardBody,
  CircularProgress,
  Heading,
  Image,
  LinkBox,
  LinkOverlay,
  Stack,
  Text,
  Wrap,
  WrapItem
} from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { MdAdd, MdHouse } from 'react-icons/md';
import { FsCol, db } from '../../firebase';
import type { Residence, ServiceLogEntry } from '../../models/types';
import { useUserStore } from '../../state/UserStore';
import AddOrEditResidence from '../Forms/AddOrEditResidence';

export const ResidenceOverview = () => {
  const family = useUserStore((state) => state.family);

  const [residences, setResidences] = useState<Residence[]>([]);
  const [isFetchingResidences, setIsFetchingResidences] = useState(false);
  const [addingResidence, setAddingResidence] = useState(false);

  const getResidences = useCallback(async () => {
    if (!family?.residences) return;

    setIsFetchingResidences(true);
    const residencesArr: Residence[] = [];

    const residenceDocs = await Promise.all(family.residences.map((residence) => getDoc(doc(db, FsCol.Residences, residence))));

    residenceDocs.forEach((resDoc) => {
      if (resDoc.exists()) {
        const docData = resDoc.data();
        docData.serviceLogEntries.forEach((entry: ServiceLogEntry) => {
          entry.date = new Date(entry.date).toLocaleDateString();
        });
        residencesArr.push(docData as Residence);
      }
    });

    setResidences(residencesArr);
    setIsFetchingResidences(false);
  }, [family?.residences]);

  useEffect(() => {
    if (family) {
      getResidences();
    }
  }, [family, getResidences]);

  return (
    <Box mt={4}>
      <Heading>Your Residences</Heading>
      {!residences ? (
        isFetchingResidences && (
          <Box mx='auto' textAlign='center' mt={20}>
            <CircularProgress isIndeterminate />
          </Box>
        )
      ) : (
        <Wrap mt={2} mb={2} gap={2}>
          {residences.map((residence) => (
            <WrapItem key={residence.name}>
              <LinkBox>
                <Card height='320px'width='240px' overflow='hidden'>
                  <CardBody p={3}>
                    <AspectRatio ratio={4 / 3}>
                      {residence.img ? (
                        <Image src={residence.img} borderRadius='lg' />
                      ) : (
                        <Box>
                          <MdHouse fontSize={120} />
                        </Box>
                      )}
                    </AspectRatio>

                    <Stack direction='column' align='center' textAlign='center' mt={4}>
                      <LinkOverlay as={Link} to={`/maintenance/residences/${residence.uid}`}>
                        <Heading size='md'>{residence.name}</Heading>
                      </LinkOverlay>
                      <Text fontSize='sm'>Moved-in {residence.yearPurchased}</Text>
                      <Text fontSize='xs'>Built {residence.yearBuilt}</Text>
                    </Stack>
                  </CardBody>
                </Card>
              </LinkBox>
            </WrapItem>
          ))}

          <WrapItem>
            <Card height='320px'width='240px' variant='outline' onClick={() => setAddingResidence(true)} borderStyle='dashed' cursor='pointer'>
              <CardBody alignContent='center'>
                <Stack direction='column' align='center'>
                  <MdAdd fontSize={120} />

                  <Text>Add residence</Text>
                </Stack>
              </CardBody>
            </Card>
          </WrapItem>
        </Wrap>
      )}

      <AddOrEditResidence isOpen={addingResidence} setIsOpen={setAddingResidence} />
    </Box>
  );
};
