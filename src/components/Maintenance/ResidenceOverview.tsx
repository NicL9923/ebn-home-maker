import {
  Box,
  Button,
  CircularProgress,
  Heading,
  Image,
  LinkBox,
  LinkOverlay,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { MdHouse } from 'react-icons/md';
import AddResidence from '../Forms/AddResidence';
import { FsCol, db } from '../../firebase';
import type { Residence, ServiceLogEntry } from '../../models/types';
import { useUserStore } from '../../state/UserStore';
import { Link } from '@tanstack/react-router';

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
                <LinkOverlay as={Link} to={`/maintenance/residences/${residence.uid}`} />

                <Box p={2} maxW='sm' borderWidth='1px' borderRadius='lg' overflow='hidden'>
                  {residence.img ? (
                    <Image height='250' src={residence.img} />
                  ) : (
                    <Box>
                      <MdHouse fontSize={96} />
                    </Box>
                  )}

                  <Text>{residence.name}</Text>
                  <Text>Built: {residence.yearBuilt}</Text>
                  <Text>Purchased: {residence.yearPurchased}</Text>
                </Box>
              </LinkBox>
            </WrapItem>
          ))}
        </Wrap>
      )}
      <Button colorScheme='green' onClick={() => setAddingResidence(true)} mt={2}>
        Add new residence
      </Button>

      <AddResidence isOpen={addingResidence} setIsOpen={setAddingResidence} />
    </Box>
  );
};
