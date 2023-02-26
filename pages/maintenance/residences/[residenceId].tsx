import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useUserStore } from '../../../src/state/UserStore';
import { Box, Button, CircularProgress, Container, Heading, Image, Stack, Text } from '@chakra-ui/react';
import { MdArrowBack } from 'react-icons/md';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { db, FsCol } from '../../../src/firebase';
import { ServiceLogEntry, Residence } from '../../../src/models/types';

const ResidenceView = () => {
  const router = useRouter();
  const residenceId = router.query['residenceId'] as string;

  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const batch = writeBatch(db);

  const [residence, setResidence] = useState<Residence | undefined>(undefined);

  const getResidence = () => {
    if (family && family.residences.includes(residenceId)) {
      getDoc(doc(db, FsCol.Residences, residenceId)).then((vehDoc) => {
        if (vehDoc.exists()) {
          const docData = vehDoc.data();
          docData.serviceLogEntries.forEach((entry: ServiceLogEntry) => {
            entry.date = new Date(entry.date).toLocaleDateString();
          });

          setResidence(docData as Residence);
        }
      });
    }
  };

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
  }, []);

  return (
    <Container centerContent mt={6}>
      <Link href='/maintenance'>
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
