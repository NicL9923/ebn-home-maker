import { Box, Button, CircularProgress, Container, Heading, Image, Stack, Text } from '@chakra-ui/react';
import { Link, useParams } from '@tanstack/react-router';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { MdArrowBack } from 'react-icons/md';
import { FsCol, db } from '../../firebase';
import { residenceRoute } from '../../main';
import { Residence, ServiceLogEntry } from '../../models/types';
import { useUserStore } from '../../state/UserStore';

const ResidenceView = () => {
  const { residenceId } = useParams({ from: residenceRoute.id });

  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const batch = writeBatch(db);

  const [residence, setResidence] = useState<Residence | undefined>(undefined);

  const getResidence = useCallback(async () => {
    if (family && family.residences.includes(residenceId)) {
      const residenceDoc = await getDoc(doc(db, FsCol.Residences, residenceId));

      if (residenceDoc.exists()) {
        const docData = residenceDoc.data();
        docData.serviceLogEntries.forEach((entry: ServiceLogEntry) => {
          entry.date = new Date(entry.date).toLocaleDateString();
        });

        setResidence(docData as Residence);
      }
    }
  }, [family, residenceId]);

  const deleteResidence = () => {
    if (!family || !profile) return;

    const newVehIdArr = family.residences.filter((res) => res !== residenceId);

    batch.update(doc(db, FsCol.Families, profile.familyId), { residences: newVehIdArr });
    batch.delete(doc(db, FsCol.Residences, residenceId));

    batch.commit();
  };

  // const addLogEntry = () => {};

  useEffect(() => {
    getResidence();
  }, [getResidence]);

  return (
    <Container centerContent mt={6}>
      <Link to='/maintenance'>
        <Button leftIcon={<MdArrowBack />} variant='link' colorScheme='blue'>
          Go back
        </Button>
      </Link>

      {residence ? (
        <Container centerContent>
          <Heading>{residence.name}</Heading>

          {residence.img && <Image src={residence.img} alt={residence.name} />}

          <Box mt={4}>
            <Text fontSize='lg'>Built: {residence.yearBuilt}</Text>
            <Text fontSize='lg'>Purchased: {residence.yearPurchased}</Text>
          </Box>

          <Stack direction='row' justifyContent='right' spacing={1} mt={3}>
            <Button size='sm' colorScheme='red' onClick={deleteResidence}>
              Delete
            </Button>
          </Stack>
        </Container>
      ) : (
        <CircularProgress isIndeterminate size={32} />
      )}
    </Container>
  );
};

export default ResidenceView;
