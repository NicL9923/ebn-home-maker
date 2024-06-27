import { AspectRatio, Button, ButtonGroup, CircularProgress, Container, Heading, Image, Stack, Text } from '@chakra-ui/react';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { MdArrowBack } from 'react-icons/md';
import ConfirmDialog from '../../components/ConfirmDialog';
import { FsCol, db } from '../../firebase';
import { residenceRoute } from '../../main';
import { Residence, ServiceLogEntry } from '../../models/types';
import { useUserStore } from '../../state/UserStore';

const ResidenceView = () => {
  const { residenceId } = useParams({ from: residenceRoute.id });
  const navigate = useNavigate();

  const profile = useUserStore((state) => state.profile);
  const family = useUserStore((state) => state.family);

  const batch = writeBatch(db);

  const [residence, setResidence] = useState<Residence | undefined>(undefined);
  const [isDeletingResidence, setIsDeletingResidence] = useState(false);

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

    const newResIdArr = family.residences.filter((res) => res !== residenceId);

    batch.update(doc(db, FsCol.Families, profile.familyId), { residences: newResIdArr });
    batch.delete(doc(db, FsCol.Residences, residenceId));

    batch.commit();

    navigate({ to: '/maintenance'});
  };

  // const addLogEntry = () => {};

  useEffect(() => {
    getResidence();
  }, [getResidence]);

  return (
    <>
      <Container>
        <Link to='/maintenance'>
          <Button leftIcon={<MdArrowBack />} variant='link' colorScheme='blue'>
            Go back
          </Button>
        </Link>

        {residence ? (
          <Stack align='center' spacing={4}>
            <Heading>{residence.name}</Heading>

            {residence.img && <AspectRatio height='250px' width='300px' ratio={4 / 3}><Image src={residence.img} borderRadius='lg' /></AspectRatio>}

            <Text fontSize='lg'>Moved-in {residence.yearPurchased}</Text>
            <Text fontSize='md'>Built in {residence.yearBuilt}</Text>

            <ButtonGroup>
              <Button size='sm' onClick={() => undefined}>
                Edit
              </Button>

              <Button size='sm' colorScheme='red' onClick={() => setIsDeletingResidence(true)}>
                Delete
              </Button>
            </ButtonGroup>
          </Stack>
        ) : (
          <CircularProgress isIndeterminate size={32} />
        )}
      </Container>

      <ConfirmDialog
        title='Delete residence'
        text='Are you sure you want to delete this residence?'
        primaryActionText='Delete'
        isOpen={isDeletingResidence}
        onClose={(confirmed) => {
          if (confirmed) {
            deleteResidence();
          }

          setIsDeletingResidence(false);
        }}
      />
    </>
  );
};

export default ResidenceView;
